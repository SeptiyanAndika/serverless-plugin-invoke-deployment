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
        let functionList = this.getFunctionList();
        let workers = [];
        functionList.forEach(item => {
            workers.push(this.invokeFunction(item.functionName, item.payload));
        })

        Promise.all(workers).then((res) => {
            this.serverless.cli.log('After Deploy: Invoke Async complete ');
        }).catch(err => {
            this.serverless.cli.log(`After Deploy: Error complete ${err}`);
        })
    }

    getFunctionList() {
        let functionList = [];
        for (const [key, value] of Object.entries(this.functions)) {
            switch (typeof value.invokeAfterDeploy) {
                case "boolean": {
                    if (value.invokeAfterDeploy === true) {
                        functionList.push({
                            functionName: `${this.serviceName}-${this.serviceStage}-${key}`,
                            payload: {}
                        })
                    }
                }
                case "object" : {
                    let options = value.invokeAfterDeploy;
                    if (options.enabled === true) {
                        functionList.push({
                            functionName: `${this.serviceName}-${this.serviceStage}-${key}`,
                            payload: options.payload || {}
                        })
                    }
                }
            }

        }
        return functionList
    }

    invokeFunction(functionName, payload) {
        this.serverless.cli.log(`After Deploy: Invoking ${functionName} with payload :${JSON.stringify(payload)}`);
        const params = {
            FunctionName: functionName,
            InvocationType: 'Event',
            Payload: JSON.stringify(payload)
        };

        return this.provider.request('Lambda', 'invoke', params)
    }
}

module.exports = InvokeDeployment;