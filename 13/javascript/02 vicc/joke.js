// Fetch a random joke
async function fetchRandomJoke() {
    try {
        const response = await fetch(`https://official-joke-api.appspot.com/jokes/random`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const joke = await response.json();
            console.log(`Random Joke: ${joke.setup} - ${joke.punchline}`);
        } else {
            console.error('Failed to fetch random joke:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching random joke:', error);
    }
}

// Fetch a joke by ID
async function fetchJokeById(id) {
    try {
        const response = await fetch(`https://official-joke-api.appspot.com/jokes/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const joke = await response.json();
            console.log(`Joke by ID (${id}): ${joke.setup} - ${joke.punchline}`);
        } else {
            console.error(`Failed to fetch joke by ID (${id}):`, response.status, response.statusText);
        }
    } catch (error) {
        console.error(`Error fetching joke by ID (${id}):`, error);
    }
}

// Fetch jokes by category
async function fetchJokesByCategory(category) {
    try {
        const response = await fetch(`https://official-joke-api.appspot.com/jokes/${category}/ten`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const jokes = await response.json();
            console.log(`Jokes in category (${category}):`);
            jokes.forEach((joke, index) => {
                console.log(`${index + 1}. ${joke.setup} - ${joke.punchline}`);
            });
        } else {
            console.error(`Failed to fetch jokes in category (${category}):`, response.status, response.statusText);
        }
    } catch (error) {
        console.error(`Error fetching jokes in category (${category}):`, error);
    }
}

// Example usage:
