class InvokeDeployment {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.functions = serverless.service.functions;
        this.provider = this.serverless.getProvider('aws');
        this.hooks = {
            'after:deploy:deploy': this.afterDeploy.bind(this)
        };
    }

    getFunctionList() {
        let functionList = [];
        let stackName = this.getStackName();
        for (const [key, value] of Object.entries(this.functions)) {
            switch (typeof value.invokeAfterDeploy) {
                case "boolean": {
                    if (value.invokeAfterDeploy === true) {
                        functionList.push({
                            functionName: `${stackName}-${key}`,
                            payload: {}
                        })
                    }
                }
                case "object" : {
                    let options = value.invokeAfterDeploy;
                    if (options.enabled === true) {
                        functionList.push({
                            functionName: `${stackName}-${key}`,
                            payload: options.payload || {}
                        })
                    }
                }
            }

        }
        return functionList
    }


    getStage() {
        let returnValue = 'dev';
        if (this.options && this.options.stage) {
            returnValue = this.options.stage;
        } else if (this.serverless.service.provider.stage) {
            returnValue = this.serverless.service.provider.stage;
            if (returnValue.indexOf("opt:stage") != -1) {
                returnValue = returnValue.split(",")[1] || 'dev';
                returnValue = returnValue.replace(/[^0-9a-zA-Z ]/g, "")
            }
        }
        return returnValue.trim();
    }

    getStackName() {
        return `${this.serverless.service.service}-${this.getStage()}`;
    }

    afterDeploy() {
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