import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

type AegisAPI = {
  openAegisDirectory: () => Promise<string | undefined>;
  toggleMoveCost: (
    config_path: string,
    enable_move_cost: boolean,
  ) => Promise<void>;
  getAppPath: () => Promise<string>;
  exportWorld: (name: string, world: string) => Promise<void>;
  path: {
    join: (...args: string[]) => Promise<string>;
    dirname: (dir: string) => Promise<string>;
  };
  fs: {
    existsSync: (arg: string) => Promise<boolean>;
    readdirSync: (arg: string) => Promise<string[]>;
    readFileSync: (arg: string) => Promise<string>;
    isDirectory: (arg: string) => Promise<boolean>;
  };
  aegis_child_process: {
    spawn: (
      aegisPath: string,
      numOfRounds: string,
      numOfAgents: string,
      worldFile: string,
    ) => Promise<string>;
    kill: (aegisPid: string) => Promise<void>;
    onStdout: (callback: (data: string) => void) => void;
    onStderr: (callback: (data: string) => void) => void;
    onExit: (callback: () => void) => void;
  };
  agent_child_process: {
    spawn: (
      agentPath: string,
      groupName: string,
      numOfAgents: string,
      agent: string,
    ) => Promise<string>;
    onStdout: (callback: (data: string) => void) => void;
    onStderr: (callback: (data: string) => void) => void;
  };
};

export const aegisAPI: AegisAPI = {
  openAegisDirectory: async () => {
    return invoke<string | undefined>("open_aegis_directory");
  },

  toggleMoveCost: async (config_path: string, value: boolean) => {
    await invoke("toggle_move_cost", {
      configPath: config_path,
      enableMoveCost: value,
    });
  },

  getAppPath: async () => {
    return invoke<string>("get_app_path");
  },

  exportWorld: async (name: string, world: string) => {
    await invoke("export_world", { defaultPath: name, content: world });
  },

  path: {
    join: async (...args: string[]) => {
      return invoke<string>("path_join", { parts: args });
    },
    dirname: async (dir: string) => {
      return invoke<string>("path_dirname", { path: dir });
    },
  },

  fs: {
    existsSync: async (arg: string) => {
      return invoke<boolean>("fs_exists_sync", { path: arg });
    },
    readdirSync: async (arg: string) => {
      return invoke<string[]>("fs_readdir_sync", { path: arg });
    },
    readFileSync: async (arg: string) => {
      return invoke<string>("fs_read_file_sync", { path: arg });
    },
    isDirectory: async (arg: string) => {
      return invoke<boolean>("fs_is_directory", { path: arg });
    },
  },

  aegis_child_process: {
    spawn: async (
      aegisPath: string,
      numOfRounds: string,
      numOfAgents: string,
      worldFile: string,
    ) => {
      return invoke<string>("spawn_aegis_process", {
        rootPath: aegisPath,
        numOfRounds,
        numOfAgents,
        worldFile,
      });
    },

    kill: async (aegisPid: string) => {
      await invoke("kill_process", { pid: aegisPid });
    },

    onStdout: (callback: (data: string) => void) => {
      listen<string>("aegis-stdout", (event) => {
        callback(event.payload);
      });
    },

    onStderr: (callback: (data: string) => void) => {
      listen<string>("aegis-stderr", (event) => {
        callback(event.payload);
      });
    },

    onExit: (callback: () => void) => {
      listen("aegis-exit", () => {
        callback();
      });
    },
  },

  agent_child_process: {
    spawn: async (
      agentPath: string,
      groupName: string,
      numOfAgents: string,
      agent: string,
    ) => {
      return invoke<string>("spawn_agent_processes", {
        rootPath: agentPath,
        groupName,
        numOfAgentsToSpawn: numOfAgents,
        agent,
      });
    },

    onStdout: (callback: (data: string) => void) => {
      listen<string>("agent-stdout", (event) => {
        callback(event.payload);
      });
    },

    onStderr: (callback: (data: string) => void) => {
      listen<string>("agent-stderr", (event) => {
        callback(event.payload);
      });
    },
  },
};
