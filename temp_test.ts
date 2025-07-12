import { validateAPIKey } from './src/utils/api';

async function runTest() {
  try {
    const result = await validateAPIKey('AIzaSyDbmz0E5cSZWjw11bL8Z9dM4IZiUp0L6zw');
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

runTest();
