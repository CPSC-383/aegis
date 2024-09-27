The following is the AEGIS config, located in `sys_files`.

```json title="aegis_config.json" linenums="1" hl_lines="12"
{
  "Send_Message": {
    "enabled": false,
    "target": "ALL_GROUPS"
  },
  "Sleep_On_Every": true,
  "Save_Surv": {
    "strategy": "ALL",
    "tie_strategy": "C_ALL"
  },
  "Predictions": true,
  "Enable_Move_Cost": true
}
```

You shouldn't touch any of the above settings except for `Enable_Move_Cost`.

When enabled, each grid in the starting world will display its respective move_cost. When disabled,
the move_cost will only update after executing a `MOVE` command and receiving the corresponding `MOVE_RESULT`.
