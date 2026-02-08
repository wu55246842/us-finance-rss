// We define local types to avoid path resolution issues with the SDK
// The structure matches standard JSON-RPC and MCP Transport interface.

export interface JSONRPCMessage {
    jsonrpc: "2.0";
    method?: string;
    params?: unknown;
    id?: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
    [key: string]: unknown;
}

export interface Transport {
    start(): Promise<void>;
    close(): Promise<void>;
    send(message: JSONRPCMessage): Promise<void>;
    onmessage?: (message: JSONRPCMessage) => void;
    onclose?: () => void;
    onerror?: (error: Error) => void;
}

export class NextjsSseTransport implements Transport {
    private _sessionId: string;
    private _controller: ReadableStreamDefaultController | null = null;

    constructor(sessionId: string) {
        this._sessionId = sessionId;
    }

    /**
     * Sets the stream controller so the transport can push messages to the client.
     */
    setController(controller: ReadableStreamDefaultController) {
        this._controller = controller;
    }

    async start(): Promise<void> {
        // Send the endpoint event to tell the client where to send POST messages
        if (this._controller) {
            const endpointEvent = `event: endpoint\ndata: /api/mcp?sessionId=${this._sessionId}\n\n`;
            this._controller.enqueue(new TextEncoder().encode(endpointEvent));
        }
    }

    async close(): Promise<void> {
        if (this._controller) {
            try {
                this._controller.close();
            } catch (e) {
                console.error("Error closing controller", e);
            }
        }
        if (this.onclose) {
            this.onclose();
        }
    }

    async send(message: JSONRPCMessage): Promise<void> {
        if (this._controller) {
            const event = `event: message\ndata: ${JSON.stringify(message)}\n\n`;
            this._controller.enqueue(new TextEncoder().encode(event));
        }
    }

    // This is called by the API route when a POST request comes in
    async handlePostMessage(message: JSONRPCMessage): Promise<void> {
        if (this.onmessage) {
            this.onmessage(message);
        }
    }

    onmessage?: (message: JSONRPCMessage) => void;
    onclose?: () => void;
    onerror?: (error: Error) => void;
}
