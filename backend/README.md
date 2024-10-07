# OpenEvals Backend

## Requirements

To run the backend service, ensure the following tools are installed on your computer:

- Python >= 3.10
- Poetry package manager
- PostgreSQL Server

To install the database server, check the following links:

- [Microsoft Windows](https://www.postgresql.org/download/windows/)
- [MacOS](https://wiki.postgresql.org/wiki/Homebrew)
- [GNU/Linux](https://www.postgresql.org/download/linux/)
- [Docker Image](https://hub.docker.com/_/postgres)

To install the `poetry` package manager, refer to the [Poetry Documentation](https://python-poetry.org/docs/).

## Getting the project

Clone the repository:

```bash
git clone git@github.com:openevals/evals.git
cd evals/backend
```

## Activating the Poetry environment

To run the server, it is recommended to use a virtual environment for installing all dependencies. To create and activate a virtual environment for `poetry`, run the following command:

```bash
poetry shell
```

A new virtual environment will be created for the current project. If there is a pre-existing environment for the project, it will be activated.

## Installing dependencies

To install dependencies and pre-commit hooks, run the following commands:

```bash
poetry install
poetry run pre-commit install
```

## Setting up the service

To run the service, some environment variables must be configured. Variables can be set as operating system variables or use a `.env` file (see `.env.example` in the project root) to provide the service with the variables. Note that in some operating system environment variables take precedence over variables defined in the `.env` file.

### Database configuration

To set up the database connection for the service, define the following environment variables:

- `POSTGRESQL_HOST`: Database server hostname or IP address.
- `POSTGRESQL_USERNAME`: Database authentication user.
- `POSTGRESQL_PASSWORD`: Database authentication password for the given user.
- `POSTGRESQL_DATABASE`: Database name.

Database configuration is mandatory for the service to run.

### OAuth configuration

This service utilizes GitHub OAuth for managing user accounts. To set this up, you need to configure the following GitHub client environment variables:

- `GITHUB_CLIENT_ID`: The client ID obtained from your OAuth application on GitHub.
- `GITHUB_CLIENT_SECRET`: The client secret associated with your OAuth application on GitHub.
- `WEB_URL`: The base URL for the web client.

Additionally, you must configure a pair of private/public keys to enable secure signing and verification of JWT tokens used in authenticating communications between the web client and backend service:

- `PRIVATE_KEY`: A Base64-encoded string containing the private key, which is used to sign the JWT tokens.
- `PUBLIC_KEY`: A Base64-encoded string containing the public key, which is used to verify the signatures of JWT tokens.

Follow these commands to generate the necessary private/public keys:

```bash
# Generate the private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:4096
# Extract the public key from the private key
openssl rsa -pubout -in private_key.pem -out public_key.pem

# Convert the private key to a Base64 string
cat private_key.pem | base64 | tr -d '\n'
# Convert the public key to a Base64 string
cat public_key.pem | base64 | tr -d '\n'
```

### Running database migrations

After configuring the environment variables, database migrations should be applied to ensure the service is working with the latest database version. Migrations can be applied with the following command:

```bash
alembic upgrade head
```

If you need to perform a migration (i.e. `models.py` was changed), you need to generate an upgrade migration.

```bash
alembic revision --autogenerate -m "<migration_message>"
```

If there are no new updates, the command will return without applying any changes.

### Running the service

To run the API service, use one of the following commands:

```bash
poetry run uvicorn main:app --host=0.0.0.0 --port=8000 --log-level=debug --reload
# or
python main.py
```

For development, the first option is most effective as it will reload the service if there are any changes in the project folder.

After running the service, API documentation can be viewed at [OpenEvals Backend API Documentation](http://localhost:8000/docs).

## Testing

To run the test AI model keys should defined in `.env` file:

- `OPENAI_API_KEY`: OpenAI API key for GPT models.
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude models.
- `GOOGLE_API_KEY`: Google API key for Genesis models.

Test can be executed with:

```bash
cd backend
PYTHONPATH=. poetry run pytest
```

To run tests in a single file, run

```bash
PYTHONPATH=. poetry run pytest <file-path>
```
