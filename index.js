class InvokeDeployment {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.serviceName = this.serverless.service.service;
        this.serviceStage = this.serverless.service.provider.stage;
        this.functions = serverless.service.functions;
        this.provider = this.serverless.getProvider('aws');
        this.hooks = {
            'after:deploy:deploy': this.postDeploy.bind(this)
        };
    }

    postDeploy() {
        let functionsName = this.getInvokeFunctionName();
        let workers = [];
        functionsName.forEach(name => {
            workers.push(this.invokeFunction(name));
        })

        Promise.all(workers).then((res) => {
            this.serverless.cli.log('After Deploy: Invoke Async complete ');
        }).catch(err => {
            this.serverless.cli.log(`After Deploy: Error complete ${err}`);
        })
    }

    getInvokeFunctionName() {
        let functionsName = [];
        for (const [key, value] of Object.entries(this.functions)) {
            if (value.invokeAfterDeploy === true) {
                functionsName.push(`${this.serviceName}-${this.serviceStage}-${key}`)
            }
        }
        return functionsName
    }

    invokeFunction(functionName) {
        this.serverless.cli.log(`After Deploy: Invoking ${functionName} ......`);
        const params = {
            FunctionName: functionName,
            InvocationType:'Event'
        };

        return this.provider.request('Lambda', 'invoke', params)
    }
}

module.exports = InvokeDeployment;