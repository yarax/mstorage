var Storage = require("../lib"),
    step = 10,
    testData = [
        {a: {aa: 1}, b: 2, c: "some string", d: 1, e: 1},
        {a: {aa: 1}, b: 3, c: "some string1", d: 1, e: 2},
        {a: {aa: 1}, b: 4, c: "some string2", d: 1, e: 1},
        {a: {aa: 1}, b: 5, c: "some string3", d: 1, e: 1},
        {a: {aa: 1}, b: 6, c: "some string4", d: 1, e: 2},
        {a: {aa: 1}, b: 7, c: "some string5", d: 1, e: 1},
        {a: {aa: 1}, b: 8, c: "some string6", d: 1, e: 2},
        {a: {aa: 1}, b: 9, c: "some string7", d: 1, e: 1},
        {b: 1, d: 1}
    ],
    testData2 = {"socialId":{"35164906":[{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":8,"message":"undefined жаждет боя. Пришло время оседлать дракона!","plannedSendTime":1397207116200,"priority":null,"__indexes__":{"socialId":0,"plannedSendTime":0}},{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":9,"message":"Какой замечательный денёк. Зайди в игру, чтобы совершить Подвиг.","plannedSendTime":1397293516201,"priority":null,"__indexes__":{"socialId":1,"plannedSendTime":0}},{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":11,"message":"Твой дракон хочет сожрать жителей соседней деревни. Зайди чтобы покормить его.","plannedSendTime":1397379916202,"priority":null,"__indexes__":{"socialId":2,"plannedSendTime":0}},{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":12,"message":"Твоему дракону очень плохо — он скучает без тебя.","plannedSendTime":1397552716202,"priority":null,"__indexes__":{"socialId":3,"plannedSendTime":0}}]},"plannedSendTime":{"1397207100000":[{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":8,"message":"undefined жаждет боя. Пришло время оседлать дракона!","plannedSendTime":1397207116200,"priority":null,"__indexes__":{"socialId":0,"plannedSendTime":0}}],"1397293500000":[{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":9,"message":"Какой замечательный денёк. Зайди в игру, чтобы совершить Подвиг.","plannedSendTime":1397293516201,"priority":null,"__indexes__":{"socialId":1,"plannedSendTime":0}}],"1397379900000":[{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":11,"message":"Твой дракон хочет сожрать жителей соседней деревни. Зайди чтобы покормить его.","plannedSendTime":1397379916202,"priority":null,"__indexes__":{"socialId":2,"plannedSendTime":0}}],"1397552700000":[{"socialId":"35164906","userId":27023,"eventTime":null,"notificationId":12,"message":"Твоему дракону очень плохо — он скучает без тебя.","plannedSendTime":1397552716202,"priority":null,"__indexes__":{"socialId":3,"plannedSendTime":0}}]}},
    assert = require('better-assert'),
    storage;

/**
 * Проверка наполнения, индексации хранилища
 */
suite('Filling storage', function(){
    setup(function(){
        var config = {
            indexFields : {
                b : {
                    discrete : false
                }
            }
            };
        storage = new Storage(config);
        storage.loadFromData(testData);
    });

    test('checking indexing by searching for findMe variable', function(){
        assert(storage.data.indexed.b[1][0] == testData[testData.length - 1]);
    });
});

/**
 * Поиск, удаление, обновление
 */
suite('Searching', function(){
    setup(function(){
        var config = {
            indexFields : {
                b : {
                    discrete : false
                },
                d : {
                    discrete: false
                }
            }
        };
        storage = new Storage(config);
        storage.loadFromData(testData);
    });

    // Поиск
    test('searching by index key "b" and additional field "c", must find 1 item', function(){
        var found = storage.find({b: 4, c: "some string2"});
        assert(found.length === 1);
    });

    test('searching by index key "b" and additional field "c", must find 0 item', function(){
        var found = storage.find({b: 4, c: "non existing string"});
        assert(found.length === 0);
    });

    test('searching by only index key "b"', function(){
        var found = storage.find({b: 4});
        assert(found.length === 1);
    });

    // Обновление
    test('searching by index key "b" and additional field "c", edit on field', function(){
        var found = storage.find({b: 4, c: "some string2"});
        found[0].a.aa = 2;
        assert(storage.data.indexed.b[4][0].a.aa === 2);
    });

    // Сортировка
    test('sorting by b', function(){
        var found = storage.find({d: 1});
        storage.sort(found, {e: "desc", b: "desc"});
        assert(found[0].b === 8);
        assert(found[1].b === 6);
        storage.sort(found, {b: "asc"});
        assert(found[0].b === 1);
        assert(found[1].b === 2);

    });

});


/**
 * Проверка дискретных индексов
 */
suite('Discrete indexing', function(){
    setup(function(){
        var config = {
            indexFields : {
                rand : {
                    discrete : true,
                    step : step
                }
            }
            },
            data = [];
        storage = new Storage(config);
        for (var i = 0; i< 100; i++) {
            data.push({i: i, rand: Math.random() * 100});
        }
        storage.loadFromData(data);
    });

    test('Filling storage with random number from 0 to 100, checking discrete filling with step ' + step, function(){

        var ky = parseInt(Object.keys(storage.data.indexed.rand)[1]),
            leftLimit = ((ky - step)) + step/2,
            rightLimit = ((ky + step)) - step/2;


        //console.log(ky, leftLimit, rightLimit);
        assert(storage.data.indexed.rand[ky].every(function (item) {
            return item.rand >= leftLimit && item.rand <= rightLimit;
        }));
    });
});


suite("Removing from different indexed fields", function () {
    setup(function () {
        storage = new Storage({
            indexFields : {
                socialId : {
                    discrete : false
                },
                plannedSendTime : {
                    discrete : true,
                    step : 60000
                }
            },
            db : {
                mysql : {}
            }
        });
        storage.data.indexed = testData2;
    });

    test("removing", function () {

        var before = storage.data.indexed.socialId["35164906"].length,
            elem = storage.data.indexed.socialId["35164906"][1],
            found = storage.remove(elem),
            after = storage.data.indexed.socialId["35164906"].length;

        assert(before === (after + 1));
    });

});






