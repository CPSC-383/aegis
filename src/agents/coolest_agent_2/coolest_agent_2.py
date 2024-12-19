from typing import override

from aegis import (
    CONNECT_OK,
    END_TURN,
    MOVE,
    MOVE_RESULT,
    OBSERVE_RESULT,
    PREDICT_RESULT,
    SAVE_SURV,
    SAVE_SURV_RESULT,
    SEND_MESSAGE,
    SEND_MESSAGE_RESULT,
    SLEEP_RESULT,
    TEAM_DIG,
    TEAM_DIG_RESULT,
    AgentCommand,
    AgentID,
    AgentIDList,
    Direction,
    Location,
    Rubble,
    Survivor,
    World,
    create_location,
)
from a3.agent import AgentController, BaseAgent, Brain

LOC_UPDATE_IDENTIFIER = "loc_update:"

JOB_ASSIGNED_IDENTIFIER = "new_job_assigned:"
JOB_UPDATE_IDENTIFIER = "job_update:"
DONE_JOB_TOKEN = "Done"


class CoolestAgent2(Brain):
    locs_with_survs: dict[Location, int] = {}

    # agent_id: (curr_location, job_location)
    agents_info: dict[int, tuple[Location, Location]] = {}
    # processed_first_round: bool = False  # if we are getting agent locs, and its the first round, give them a job immediately!
    jobs_to_give: list[Location] = []
    my_job_loc: Location | None = None

    def __init__(self) -> None:
        super().__init__()
        self._agent: AgentController = BaseAgent.get_agent()

    @override
    def handle_connect_ok(self, connect_ok: CONNECT_OK) -> None:
        self._agent.log("CONNECT_OK")

    @override
    def handle_disconnect(self) -> None:
        self._agent.log("DISCONNECT")

    @override
    def handle_dead(self) -> None:
        self._agent.log("DEAD")

    @override
    def handle_send_message_result(self, smr: SEND_MESSAGE_RESULT) -> None:
        # should always only be agent_id == 1 getting loc_update messages, but just double checking
        if self._agent.get_agent_id().id == 1:
            self.team_leader_handle_message(smr)

        # check if I was sent a new job to start performing
        self.new_job_handle_message(smr)

    @override
    def handle_move_result(self, mr: MOVE_RESULT) -> None:
        pass

    @override
    def handle_observe_result(self, ovr: OBSERVE_RESULT) -> None:
        self._agent.log(f"OBSERVER_RESULT: {ovr}")
        self._agent.log(f"{ovr.energy_level}")
        self._agent.log(f"{ovr.life_signals}")
        self._agent.log(f"{ovr.cell_info}")
        self._agent.log(f"{ovr}")

    @override
    def handle_save_surv_result(self, ssr: SAVE_SURV_RESULT) -> None:
        self._agent.log(f"SAVE_SURV_RESULT: {ssr}")
        pass

    @override
    def handle_predict_result(self, prd: PREDICT_RESULT) -> None:
        self._agent.log(f"PREDICT_RESULT: {prd}")
        self._agent.log(f"{prd}")

    @override
    def handle_sleep_result(self, sr: SLEEP_RESULT) -> None:
        self._agent.log(f"SLEEP_RESULT: {sr}")
        self._agent.log(f"{sr}")

    @override
    def handle_team_dig_result(self, tdr: TEAM_DIG_RESULT) -> None:
        self._agent.log(f"TEAM_DIG_RSULT: {tdr}")
        pass

    @override
    def think(self) -> None:
        self._agent.log("Thinking")

        world = self.get_world()
        if world is None:
            return

        # Every round, send a message of our current location to agent id 1 (team leader!)
        self._agent.send(
            SEND_MESSAGE(
                AgentIDList([AgentID(1, self._agent.get_agent_id().gid)]),
                f"{LOC_UPDATE_IDENTIFIER}{self._agent.get_agent_id().id}@{self._agent.get_location()}",
            )
        )

        # Retrieve the current state of the world, and find all the survivors on the map
        # TODO: do agents other than team leader need this?
        self.populate_surv_spots(world)

        if self._agent.get_round_number() == 1:
            if self._agent.get_agent_id().id == 1:
                # team leader needs to create initial job list from the surv locations in the world
                for loc, _ in self.locs_with_survs.items():
                    self.jobs_to_give.append(loc)

        if self._agent.get_agent_id().id == 1 and self._agent.get_round_number() > 1:
            # each round, team leader assigns jobs to all agents

            # check if an agent has None as their job location. If so, give them a new job
            for agent_id, (agent_loc, agent_job) in self.agents_info.items():
                # BaseAgent.log(LogLevels.Always, f"agent_id: {agent_id} | agent_job: {agent_job}")
                if agent_job == create_location(-1, -1):
                    # print("Saw an agent had no job, giving them one")
                    self.assign_new_job(agent_id, agent_loc)

        # if on top of the closest surv, try saving it or digging to it, depending on what the top layer is
        if self.my_job_loc is not None:
            if self._agent.get_location() == self.my_job_loc:
                cell = world.get_cell_at(self.my_job_loc)
                if cell is None:
                    return
                top_layer = cell.get_top_layer()

                if top_layer is None:
                    # The job is done. Tell team leader you need a new job!
                    self.my_job_loc = None
                    self._agent.send(
                        SEND_MESSAGE(
                            AgentIDList([AgentID(1, self._agent.get_agent_id().gid)]),
                            f"{JOB_UPDATE_IDENTIFIER}{self._agent.get_agent_id().id}@{DONE_JOB_TOKEN}",
                        )
                    )
                if isinstance(top_layer, Rubble):
                    self.send_and_end_turn(TEAM_DIG())
                    return
                elif isinstance(top_layer, Survivor):
                    self.send_and_end_turn(SAVE_SURV())
                    return
            else:
                # if not on the locaion of my job location, move towards it
                dir_to_goal: Direction = self.move_towards_goal(self.my_job_loc)
                self.send_and_end_turn(MOVE(dir_to_goal))
                return
        else:
            # don't current have a job. just relax for now
            # TODO: maybe implement an OBSERVE here?
            pass

        # # Default action: Move the agent north if no other specific conditions are met.
        print("Didn't send a command, thats not good...")
        self.send_and_end_turn(MOVE(Direction.CENTER))

    def send_and_end_turn(self, command: AgentCommand):
        """Send a command and end your turn."""
        self._agent.log(f"SENDING {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())

    def loc_str_to_loc(self, loc_str: str) -> Location:
        loc_str = loc_str.strip("()")
        loc_str_list = loc_str.split(", ")
        x: int = int(loc_str_list[0].strip()[2:])
        y: int = int(loc_str_list[1].strip()[2:])
        return create_location(x, y)

    def populate_surv_spots(self, world: World):
        self.locs_with_survs = {}
        for row in world.get_world_grid():
            for cell in row:
                if cell.has_survivors:
                    self.locs_with_survs[cell.location] = cell.has_survivors

    def move_towards_goal(self, goal: Location) -> Direction:
        agent_loc = self._agent.get_location()
        dir_to_goal = agent_loc.direction_to(goal)
        return dir_to_goal

    def new_job_handle_message(self, smr: SEND_MESSAGE_RESULT) -> None:
        agent_message = smr.msg

        if agent_message.startswith(JOB_ASSIGNED_IDENTIFIER):
            # big boss gave me a job! Make that my new job
            self._agent.log(f"job identifier found! {agent_message}")
            agent_message = agent_message[len(JOB_ASSIGNED_IDENTIFIER) :]
            agent_id, agent_job_loc = agent_message.split("@")
            agent_id = int(agent_id)
            agent_job_loc = self.loc_str_to_loc(agent_job_loc)
            self.my_job_loc = agent_job_loc
            self._agent.log(f"New job assigned: {self.my_job_loc}")

    def team_leader_handle_message(self, smr: SEND_MESSAGE_RESULT) -> None:
        agent_message = smr.msg

        # process the location update message
        if agent_message.startswith(LOC_UPDATE_IDENTIFIER):
            # get the agent id and location from the message
            agent_message = agent_message[len(LOC_UPDATE_IDENTIFIER) :]
            agent_id, agent_loc_str = agent_message.split("@")
            agent_id = int(agent_id)
            agent_loc = self.loc_str_to_loc(agent_loc_str)

            # update the location of the agent ("None" job if we are initializing them into the dict)
            if agent_id not in self.agents_info:
                self.agents_info[agent_id] = (agent_loc, create_location(-1, -1))
            else:
                self.agents_info[agent_id] = (agent_loc, self.agents_info[agent_id][1])

        elif agent_message.startswith(JOB_UPDATE_IDENTIFIER):
            agent_message = agent_message[len(JOB_UPDATE_IDENTIFIER) :]
            agent_id, agent_job_status = agent_message.split("@")
            agent_id = int(agent_id)
            if agent_job_status == DONE_JOB_TOKEN:
                self._agent.log(f"Agent {agent_id} has finished their job!")
                # agent has finished their job. Give them a new one!
                agent_loc, _ = self.agents_info[int(agent_id)]
                job_loc: Location = self.get_a_job(agent_loc)
                self.agents_info[int(agent_id)] = (agent_loc, job_loc)

    def get_a_job(self, agent_loc: Location) -> Location:
        if len(self.jobs_to_give) == 0:
            return create_location(-1, -1)

        # find the closest job to the agent
        closest_job = self.jobs_to_give[0]
        closest_dist = agent_loc.distance_to(closest_job)
        for job in self.jobs_to_give:
            dist = agent_loc.distance_to(job)
            if dist < closest_dist:
                closest_job = job
                closest_dist = dist

        # remove the job from the list of jobs to give
        self.jobs_to_give.remove(closest_job)
        return closest_job

    def assign_new_job(self, agent_id: int, agent_loc: Location) -> None:
        """get a new job for the agent, assign it to them, and send it to them"""
        # get new job
        new_job_loc = self.get_a_job(agent_loc)

        # assign new job
        self.agents_info[agent_id] = (agent_loc, new_job_loc)

        # send new job
        self._agent.send(
            SEND_MESSAGE(
                AgentIDList([AgentID(agent_id, self._agent.get_agent_id().gid)]),
                f"{JOB_ASSIGNED_IDENTIFIER}{agent_id}@{new_job_loc}",
            )
        )
