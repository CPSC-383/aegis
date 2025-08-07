/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ClientConfig {
  configType: "assignment" | "competition" | null
  variableAgentAmount: boolean
  defaultAgentAmount: number
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && typeof current === "object" ? current[key] : undefined
  }, obj)
}

export function parseClientConfig(configData: any): ClientConfig {
  const defaults: ClientConfig = {
    configType: null,
    variableAgentAmount: false,
    defaultAgentAmount: 1,
  }

  try {
    const configType = getNestedValue(configData, "client.CONFIG_TYPE")
    if (configType === "assignment" || configType === "competition") {
      defaults.configType = configType
    }

    const variableAgentAmount = getNestedValue(
      configData,
      "features.ALLOW_CUSTOM_AGENT_COUNT"
    )
    if (typeof variableAgentAmount === "boolean") {
      defaults.variableAgentAmount = variableAgentAmount
    }

    const defaultAgentAmount = getNestedValue(
      configData,
      "features.DEFAULT_AGENT_AMOUNT"
    )
    if (typeof defaultAgentAmount === "number" && defaultAgentAmount > 0) {
      defaults.defaultAgentAmount = defaultAgentAmount
    }

    return defaults
  } catch (error) {
    console.warn("Error parsing config, using defaults:", error)
    return defaults
  }
}

export function getConfigValue(configData: any, path: string): any {
  return getNestedValue(configData, path)
}
