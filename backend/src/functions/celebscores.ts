import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// Define the function to handle the request
export async function celebscores(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Get the "name" parameter from the query or body
    const name = request.query.get('name') || await request.text() || 'world';

    // Return the response as an object
    return {
        status: 200,
        body: `Hello, ${name}!`,
        headers: {
            "Access-Control-Allow-Origin": "*",  // Allow frontend requests
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    };
};

// Register the HTTP trigger handler with the app
app.http('celebscores', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: celebscores,
});
