# Project Constitution: gemini.md

## Data Schemas

### Bot Schema
```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "identity": {
    "vibe": "friendly | professional | sarcastic | custom",
    "customPrompt": "string (optional)",
    "avatarUrl": "string"
  },
  "knowledgeBase": [
    {
      "id": "number",
      "type": "file | url | text",
      "source": "string",
      "metadata": {
        "size": "string",
        "lastIndexed": "timestamp"
      }
    }
  ],
  "widgetConfig": {
    "primaryColor": "hex_string",
    "theme": "light | dark",
    "welcomeMessage": "string",
    "template": "classic | modern | minimal | bold"
  },
  "handoffRules": {
    "angerThreshold": "number (0-100)",
    "action": "email",
    "targetEmail": "string",
    "collectUserEmail": "boolean",
    "alertsEnabled": "boolean"
  },
  "stats": {
    "totalChats": "number",
    "lastActive": "timestamp",
    "status": "active | inactive"
  }
}
```

### Conversation Schema
```json
{
  "id": "string",
  "botId": "number",
  "contact": {
    "email": "string",
    "name": "string",
    "avatarUrl": "string"
  },
  "status": "active | closed | handoff",
  "satisfaction": "good | bad | neutral",
  "messages": [
    {
      "id": "number",
      "sender": "user | bot | agent",
      "text": "string",
      "timestamp": "timestamp"
    }
  ],
  "lastMessageAt": "timestamp"
}
```

## Behavioral Rules
1. **Deterministic Logic First**: Use Python tools in `tools/` for predictable operations (math, API calls).
2. **AI Personality**: Follow the "vibe" defined in the Bot Schema. Default to "Friendly" if unspecified.
3. **Escalation**: Always provide an "escape hatch" for human handoff when sentiment score for "anger" exceeds 70 or after 3 consecutive retrieval failures.
4. **Data Privacy**: Never store PII (Personally Identifiable Information) in `.tmp/` beyond the session lifetime.
5. **Transparency**: All AI-generated responses should ideally include a "source" or "confidence" indicator in the metadata.

## Architectural Invariants
1. Logic must be deterministic and reside in SOPs (`architecture/`) or Python scripts (`tools/`).
2. Tools must be atomic and testable.
3. `.env` is the only source for secrets.
4. `.tmp/` is for all intermediate data.

## Maintenance Log
*Empty.*
