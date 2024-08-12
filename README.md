# evals

## OpenEvals Backend API Service

### Requeriments

For running the backend service there are few tools that you need to check on your computer:

- Python >= 3.10
- Poetry package manager
- PostgreSQL Server

To install database server can check:

- [Microsoft Windows](https://www.postgresql.org/download/windows/)
- [MaxOS](https://postgresapp.com/)
- [GNU/Linux](https://www.postgresql.org/download/linux/)
- [Docker Image](https://hub.docker.com/_/postgres)

To install `poetry` package manager can check [Poetry Documentation](https://python-poetry.org/docs/).

### Getting the project

Clone the repository

```bash
git clone git@github.com:openevals/evals.git
cd evals/backend
```

### Activating Poetry environment

To start running the server the main recomendation is to use a virtual environment to install all dependencies. To create a virtual environment for `poetry` in the proyect can run the following command line:

```bash
poetry shell
```

New virtual environment will be created for the current project. If there is a previous environment for the project the environment will be activated.

After creating the or activating the environment `PYTHONPATH` environment variable should be set to stablish the correct path for importing base project files.

```bash
export PYTHONPATH=../
```

In this case the `PYTHONPATH` is set to the repository root folder (`evals`) instead the default value that is pointing to the project root folder (`backend`). Current value is set as relative path but can be set as an absolute one.

### Installing dependencies

To install dependencies can run the following command line:

```bash
poetry install
```

### Setting up the service

In order to run the service there are some environment variables that must be configured. Variables can be set as operating system variables or use `.env` (see for example `.env.example` into the project root) file to provide the service with the variables. Take into account that operating system environment variables has precedence over variables defined in `.env` file.

#### Database configuration

To setup database connection on the service you must define the following environment variables:

- `POSTGRESQL_HOST`: Database server hostname or ip address.
- `POSTGRESQL_USERNAME`: Database authentication user.
- `POSTGRESQL_PASSWORD`: Database authentication password for the given user.
- `POSTGRESQL_DATABASE`: Database name.

Database configuration is mandatory for service running.

#### AI Models integrations

Currently the service support for the three major AI models providers. API keys for each provider should be configure as environment variable:

- `OPENAI_API_KEY`: OpenAI API key for GPT models.
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude models.
- `GOOGLE_API_KEY`: Google API key for Genesis models.

#### Running database migrations

After configuring the environment variables the database migrations should be applied to be sure the service is working with the latest database version. Migrations can be applied with the following command line:

```bash
alembic upgrade head
```

If there is no any new update the command will return without applying any change.

#### Configure and run the service

To run the API service can use one of the following comman lines.

```bash
uvicorn backend.main:app --host=0.0.0.0 --port=8000 --log-level=debug --reload
# or
pyhton main.py
```

For developing the most effective option is the first one that will reload the service if there is any change on the project folder.

After running the service, API documentation can be checked on [OpenEvals Backend API Documentation](http://localhost:8000/docs).

#### Running the service with Docker

### Testing
