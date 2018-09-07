# Serverless Plugin Invoke Deployment

This Plugin used to invoke automatically function after deployment.

## Installation

Install with **npm**:
```sh
npm install --save-dev serverless-plugin-invoke-deployment
```

And then add the plugin to your `serverless.yml` file:
```yaml
plugins:
  - serverless-plugin-invoke-deployment
```

Alternatively, install with the Serverless **plugin command** (Serverless Framework 1.22 or higher):
```sh
sls plugin install -n serverless-plugin-invoke-deployment
```

## Usage

In the function definition add `invokeAfterDeploy: true`
```yaml
functions:
  hello:
    handler: handler.hello
    invokeAfterDeploy: true
```

if want use input param (payload) can use detail for invokeAfterDeploy
```yaml
functions:
  hello:
    handler: handler.hello
    invokeAfterDeploy:
      enabled: true
      payload:
        varA : varA
        varB : 20
        varObject:
          object1 : a
          object2 : 1
        varArray:
          - a
          - b
```

## License
MIT license.