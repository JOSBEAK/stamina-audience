# queue

This library provides a generic queue infrastructure for the LeadSend monorepo using AWS SQS and S3/R2 storage.

## Features

- Generic SQS queue configuration
- S3/R2 file storage operations
- Type-safe message handling
- Consistent error handling and logging
- Reusable worker patterns

## Building

Run `nx build queue` to build the library.

## Running unit tests

Run `nx test queue` to execute the unit tests via [Jest](https://jestjs.io). 