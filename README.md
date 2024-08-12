# evals

## OpenEvals Backend API Service

### Requirements

To run the backend service, ensure the following tools are installed on your computer:

- Python >= 3.10
- Poetry package manager
- PostgreSQL Server

To install the database server, check the following links:

- [Microsoft Windows](https://www.postgresql.org/download/windows/)
- [MaxOS](https://postgresapp.com/)
- [GNU/Linux](https://www.postgresql.org/download/linux/)
- [Docker Image](https://hub.docker.com/_/postgres)

To install the `poetry` package manager, refer to the [Poetry Documentation](https://python-poetry.org/docs/).

### Getting the project

Clone the repository:

```bash
git clone git@github.com:openevals/evals.git
cd evals/backend
```

### Activating the Poetry environment

To run the server, it is recommended to use a virtual environment for installing all dependencies. To create and activate a virtual environment for `poetry`, run the following command:

```bash
poetry shell
```

A new virtual environment will be created for the current project. If there is a pre-existing environment for the project, it will be activated.

After creating or activating the environment, the `PYTHONPATH` environment variable should be set to establish the correct path for importing base project files.

```bash
export PYTHONPATH=../
```

In this case, the `PYTHONPATH` is set to the repository's root folder (`evals`), not the default value that points to the project root folder (`backend`). The current value is set as a relative path but can be set as an absolute path.

### Installing dependencies

To install dependencies and pre-commit hooks, run the following commands:

```bash
poetry install
poetry run pre-commit install
```

### Setting up the service

To run the service, some environment variables must be configured. Variables can be set as operating system variables or use a `.env` file (see `.env.example` in the project root) to provide the service with the variables. Note that in some operating system environment variables take precedence over variables defined in the `.env` file.

#### Database configuration

To set up the database connection for the service, define the following environment variables:

- `POSTGRESQL_HOST`: Database server hostname or IP address.
- `POSTGRESQL_USERNAME`: Database authentication user.
- `POSTGRESQL_PASSWORD`: Database authentication password for the given user.
- `POSTGRESQL_DATABASE`: Database name.

Database configuration is mandatory for the service to run.

#### AI Models integrations

The service currently supports the three major AI models providers. API keys for each provider should be configured as an environment variable:

- `OPENAI_API_KEY`: OpenAI API key for GPT models.
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude models.
- `GOOGLE_API_KEY`: Google API key for Genesis models.

#### Running database migrations

After configuring the environment variables, database migrations should be applied to ensure the service is working with the latest database version. Migrations can be applied with the following command:

```bash
alembic upgrade head
```

If you need to perform a migration (i.e. `models.py` was changed), you need to generate an upgrade migration.

```bash
alembic revision --autogenerate -m "<migration_message>"
```

If there are no new updates, the command will return without applying any changes.

#### Running the service

To run the API service, use one of the following commands:

```bash
uvicorn backend.main:app --host=0.0.0.0 --port=8000 --log-level=debug --reload
# or
python main.py
```

For development, the first option is most effective as it will reload the service if there are any changes in the project folder.

After running the service, API documentation can be viewed at [OpenEvals Backend API Documentation](http://localhost:8000/docs).

#### Running the service with Docker

### Testing

To run pytest, make sure `/backend` directory is in the PYTHONPATH.
```bash
cd backend
poetry run pytest
```

To run tests in a single file, run
```bash
poetry run pytest <file-path>
```