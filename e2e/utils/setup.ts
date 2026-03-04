import { execSync } from 'child_process';

const CONTAINER_NAME =
  process.env.E2E_CONTAINER_NAME || 'headwaione-backend-e2e';

/**
 * Prepare the database for testing before each test.
 * Runs the prepare script inside the Docker container via `docker exec`.
 */
export async function prepareDatabase() {
  try {
    console.log('Preparing database for test...');
    console.log('in container', CONTAINER_NAME);

    // Check if the prepare script exists in the container
    try {
      execSync(
        `docker container exec ${CONTAINER_NAME} test -f /app/prepare-db-for-test.sh`,
        {
          stdio: 'pipe',
        },
      );
    } catch (error) {
      console.log(
        'Database preparation script not found in container, skipping database preparation',
      );
      console.log(
        'This is expected for kinoel tests which use production-like data setup',
      );
      return;
    }

    execSync(
      `docker container exec ${CONTAINER_NAME} bash /app/prepare-db-for-test.sh`,
      {
        stdio: 'inherit',
      },
    );
    console.log('Database prepared successfully');
  } catch (error) {
    console.error('Database preparation failed:', error);
    throw error;
  }
}
