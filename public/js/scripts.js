document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOrUsername = document.getElementById('emailOrUsername').value;
    const password = document.getElementById('password').value;

    console.log(emailOrUsername, password);

    const errorMessageElement = document.getElementById('error-message');

    try {
        const response = await fetch('/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailOrUsername.includes('@') ? emailOrUsername : null,
                username: !emailOrUsername.includes('@') ? emailOrUsername : null,
                password,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong');
        }

        // Handle successful login (e.g., redirect or show a success message)
        window.location.href = '/'; // Redirect to a dashboard or other page after login

    } catch (error) {
        errorMessageElement.textContent = error.message;
    }
});
