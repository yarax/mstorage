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
    
    
