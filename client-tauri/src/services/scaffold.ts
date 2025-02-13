import { useEffect, useRef, useState } from "react";
import { ClientWebSocket, aegisAPI } from "@/services";
import { useAppContext } from "@/contexts/AppContext";
import { Simulation } from "@/core/simulation";
import { useForceUpdate } from "@/utils/utils";
import { ConsoleLine } from "@/types";

export type Scaffold = {
  aegisPath: string | undefined;
  setupAegisPath: () => Promise<void>;
  worlds: string[];
  agents: string[];
  output: ConsoleLine[];
  startSimulation: (
    numRounds: number,
    numAgentsAegis: number,
    worldFile: string,
  ) => void;
  toggleMoveCost: (value: boolean) => void;
  killSim: (() => void) | undefined;
  readAegisConfig: () => Promise<string>;
};

export function createScaffold(): Scaffold {
  const { setAppState } = useAppContext();
  const [aegisPath, setAegisPath] = useState<string | undefined>(undefined);
  const [worlds, setWorlds] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [output, setOutput] = useState<ConsoleLine[]>([]);
  const aegisPid = useRef<string | undefined>(undefined);
  const forceUpdate = useForceUpdate();

  const addOutput = (data: string, has_error: boolean) => {
    const splitData = data.split("\n");
    const formattedData = splitData.map((line) => ({
      has_error,
      message: line,
    }));
    setOutput((prevOutput) => prevOutput.concat(formattedData));
  };

  const setupAegisPath = async () => {
    const path = await aegisAPI!.openAegisDirectory();
    if (path) setAegisPath(path);
  };

  const startSimulation = async (
    numRounds: number,
    numAgentsAegis: number,
    worldFile: string,
  ) => {
    if (!aegisPath) {
      throw new Error("Can't find AEGIS path!");
    }

    // Reset output
    setOutput([]);

    const pid = await aegisAPI.aegis_child_process.spawn(
      aegisPath,
      numRounds.toString(),
      numAgentsAegis.toString(),
      worldFile,
    );
    aegisPid.current = pid;
    forceUpdate();
  };

  const toggleMoveCost = async (value: boolean) => {
    if (!aegisPath) {
      throw new Error("Can't find AEGIS path!");
    }

    const path = aegisAPI.path;

    const config_path = await path.join(
      aegisPath,
      "sys_files",
      "aegis_config.json",
    );
    aegisAPI.toggleMoveCost(config_path, value);
  };

  const readAegisConfig = async () => {
    if (!aegisPath) {
      throw new Error("Can't find AEGIS path!");
    }

    const fs = aegisAPI.fs;
    const path = aegisAPI.path;

    const config_path = await path.join(
      aegisPath,
      "sys_files",
      "aegis_config.json",
    );
    const config = await fs.readFileSync(config_path);
    return config;
  };

  const killSimulation = () => {
    if (!aegisPid.current) return;
    aegisAPI.aegis_child_process.kill(aegisPid.current);
    aegisPid.current = undefined;
    forceUpdate();
  };

  useEffect(() => {
    getAegisPath().then((path) => {
      setAegisPath(path);
    });

    // Setup aegis listeners once
    aegisAPI.aegis_child_process.onStdout((data: string) => {
      addOutput(data, false);
    });

    aegisAPI.aegis_child_process.onStderr((data: string) => {
      addOutput(data, true);
    });

    aegisAPI.aegis_child_process.onExit(() => {
      aegisPid.current = undefined;
      forceUpdate();
    });

    // Setup agent listeners once
    aegisAPI.agent_child_process.onStdout((data: string) => {
      addOutput(data, false);
    });

    aegisAPI.agent_child_process.onStderr((data: string) => {
      addOutput(data, true);
    });

    const onSimCreated = (sim: Simulation) => {
      setAppState((prevAppState) => ({
        ...prevAppState,
        simulation: sim,
      }));
    };
    new ClientWebSocket(onSimCreated);
  }, []);

  useEffect(() => {
    if (!aegisPath) return;

    getWorlds(aegisPath).then((worlds) => {
      setWorlds(worlds);
    });
    getAgents(aegisPath).then((agents) => {
      setAgents(agents);
    });
    localStorage.setItem("aegisPath", aegisPath);
  }, [aegisPath]);

  const killSim = aegisPid.current ? killSimulation : undefined;
  return {
    aegisPath,
    setupAegisPath,
    worlds,
    agents,
    output,
    startSimulation,
    toggleMoveCost,
    killSim,
    readAegisConfig,
  };
}

const getAegisPath = async () => {
  const localPath = localStorage.getItem("aegisPath");
  if (localPath) return localPath;

  let currentDir: string = await aegisAPI!.getAppPath();
  const fs = aegisAPI!.fs;
  const path = aegisAPI!.path;

  while (true) {
    const worldsDir = await path.join(currentDir, "worlds");
    if (await fs.existsSync(worldsDir)) {
      return currentDir;
    }

    currentDir = await path.dirname(currentDir);

    if (currentDir === (await path.dirname(currentDir))) {
      return undefined;
    }
  }
};

const getWorlds = async (aegisPath: string) => {
  const fs = aegisAPI.fs;
  const path = aegisAPI.path;

  const worldsPath = await path.join(aegisPath, "worlds");
  if (!(await fs.existsSync(worldsPath))) return [];

  const worlds = await fs.readdirSync(worldsPath);
  const filtered_worlds = worlds.filter((world) => world.endsWith(".world"));
  return filtered_worlds;
};

const getAgents = async (aegisPath: string) => {
  const fs = aegisAPI.fs;
  const path = aegisAPI.path;

  const agentsPath = await path.join(aegisPath, "src", "agents");
  if (!(await fs.existsSync(agentsPath))) return [];

  const agentsDirs = await fs.readdirSync(agentsPath);

  // Only take the agents that have 'main.py' in their folders
  const agents: string[] = [];
  for (const agent of agentsDirs) {
    const agentPath = await path.join(agentsPath, agent);
    if (!(await fs.isDirectory(agentPath))) continue;
    const agentFiles = await fs.readdirSync(agentPath);
    if (!agentFiles.includes("main.py")) continue;
    agents.push(agent);
  }
  return agents;
};
