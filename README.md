The library allows you to keep indexed data in memory, provides fast searching and simple synchronous work

## Usage

    var storage = new Storage({
        indexFields : {
            userId : {
                discrete : false
            },
            birthDate : {
                discrete : true,
                step : 1000*60*60*24*365*5 // by 5 years
            }
        }
    });
    
    
```javascript
    /**
     * Check room+domain and return public room statistics. If domain param exists, it will check for correspondence
     * @method
     * @name Test#init
     * @param {string} roomName - room name
     * @param {string} domain - domain
     * 
     */
    Test.prototype.init = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/init';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (parameters['roomName'] !== undefined) {
            queryParameters['roomName'] = parameters['roomName'];
        }


```
