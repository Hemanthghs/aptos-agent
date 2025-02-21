# Aptos Assistant
# Running Aptos Locally

This guide provides step-by-step instructions to install, build, and run Aptos locally. Additionally, it explains how to interact with the agent using REST.

## Prerequisites
Ensure you have the following installed on your system:
- Node.js (Recommended: Latest LTS version)
- pnpm (Package Manager for Node.js)
- Required dependencies as specified in the project's package.json

## 1. Install Dependencies and Build the Project
To set up Aptos, install all required dependencies and build the project.

### Install Dependencies
Run the following command to install dependencies without a frozen lockfile:
```sh
pnpm install --no-frozen-lockfile
```
Then, install dependencies again to ensure everything is set up:
```sh
pnpm install
```

### Build the Project
To compile all necessary files and prepare the application for execution, run:
```sh
pnpm build:base
```

## 2. Start the Aptos Agent
Navigate to the `agent` directory and start the agent:
```sh
cd agent
pnpm install
pnpm start
```


## 4. Interacting with the Agent
Once the agent is running, you can interact with it using the following methods:

### 1. REST Client
You can communicate with the agent using a REST API request.

#### Endpoint
```
http://localhost:9000/agentId/message
```

#### Request Body
```json
{
  "userId": "",
  "chatId": "",
  "text": "Explain about smart contract in aptos?"
}
```
*Make sure to remember the `chatId` to maintain context across interactions.*


## Summary
1. Install dependencies and build the project.
2. Navigate to `agent` and start the agent.
3. Interact with the agent using REST API.

With these steps, your Aptos agent should be fully operational and ready to assist!



 ## RAG (Retrieval-Augmented Generation)
RAG enhances the agent's responses by incorporating knowledge from Aptos documentation.
### How RAG Works

Document Indexing:

The system crawls specified Aptos documentation URLs
Content is processed and embedded using advanced language models
Embeddings are stored in a vector database for efficient retrieval


### Query Processing:

User queries are converted to embeddings
Relevant documentation is retrieved based on semantic similarity
Retrieved content is incorporated into the prompt
Enhanced prompt is sent to the LLM for response generation
