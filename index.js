var fs              = require("fs"),
    globalConfig    = require("config"),
    Storage         = function (config) {
        this.config = config;

        this.data = {
            indexed : {}
        };

        setInterval(this.garbageCollector.bind(this), 5000);
    };

Storage.prototype = {

    /**
     * Чистит пустые индексы
     */
    garbageCollector : function () {
        var scope = this,
            num = 0;
        Object.keys(this.data.indexed).forEach(function (field) {
            Object.keys(scope.data.indexed[field]).forEach(function (key) {
                if (!scope.data.indexed[field][key].length) {
                    delete scope.data.indexed[field][key];
                } else {
                    num+=scope.data.indexed[field][key].length;
                }
            });
        });
        if (num > this.config.limitCount) {
            logger.error("Alarm, limit is overflowed!");
        }
    },

    /**
     * Добавляет новую запись
     * TESTED
     * @param row
     */
    addRow : function (row) {
        var scope = this,
            storage = this.data,
            conf = this.config;
        // Заполняем индексированные поля

        Object.keys(conf.indexFields).forEach(function (indexField) {
            var configItem = conf.indexFields[indexField],
                frameIndex;
            if (!storage.indexed[indexField]) {
                storage.indexed[indexField] = {};
            }
            if (row[indexField] === undefined) {
                throw new Error("A row has no index field '" + indexField +"': " + JSON.stringify(row));
            }
            if (configItem.discrete) { // Дискретное
                if (!configItem.step) {
                    throw new Error("No step in discrete config field");
                }
                frameIndex = scope.getDiscreteValue(row[indexField], configItem.step);
                if (!storage.indexed[indexField][frameIndex]) {
                    storage.indexed[indexField][frameIndex] = [];
                }

                storage.indexed[indexField][frameIndex].push(row);
            } else { // Обычное
                if (!storage.indexed[indexField][row[indexField]]) {
                    storage.indexed[indexField][row[indexField]] = [];
                }

                storage.indexed[indexField][row[indexField]].push(row);
            }
        });
    },

    /**
     * Ищет по первому индексированному полю в критерии
     * @param criteria {userId: 666}
     * TESTED
     */
    findWithIndexes : function (criteria) {
        var conf = this.config,
            found = [],
            criteriaFields = Object.keys(criteria),
            indexedCriteriaField,
            nonIndexedCriteriaFields = [],
            storage = this.data;

        criteriaFields.forEach(function (field) {
            var res =  conf.indexFields[field];
            if (!res) {
                nonIndexedCriteriaFields.push(field);
            } else {
                if (indexedCriteriaField) {
                    throw new Error("Searching by several indexed fields doesn't implemented");
                }
                indexedCriteriaField = field;
            }
        });


        found = storage.indexed[indexedCriteriaField] && storage.indexed[indexedCriteriaField][criteria[indexedCriteriaField]] || [];

        return {
            foundByIndex : found,
            criteriaPassedIndexes : !found.length ? [] : Object.keys(found).filter(function (index) {
                return nonIndexedCriteriaFields.every(function (field) {
                    return found[index][field] === criteria[field];
                });
            })
        };

    },

    /**
     *
     * @param criteria
     * @returns Array
     * TESTED
     */
    find : function (criteria) {
        var found = this.findWithIndexes(criteria),
            res = found.criteriaPassedIndexes.map(function (index) {
                return found.foundByIndex[index];
            });

        return res;
    },

    findOne : function (criteria) {
        return this.find(criteria)[0];
    },

    sort : function (items, sortCases) {

        var fields = Object.keys(sortCases);

        items.sort(function (l, r) {
            var res;
            fields.some(function (f) {
                if (l[f] !== r[f]) {
                    res = sortCases[f] === "desc" ? l[f] < r[f] : l[f] > r[f];
                    return true;
                } else {
                    return false;
                }
            });

            return res;
        });
    },

    /**
     * Удаляет элемент
     * @param element
     */
    remove : function (element) {
        var scope = this;

        Object.keys(this.data.indexed).forEach(function (field) {

//            logger.error("Removing", element, field, scope.getKey(field, element[field]), scope.data.indexed[field][scope.getKey(field, element[field])]);

            var val = scope.getKey(field, element[field]),
                stack = scope.data.indexed[field][val],
                index = stack.indexOf(element);

            stack.splice(index, 1);
        });

    },

    removeAll : function (criteria) {
        var scope = this,
            items = this.find(criteria);

        items.forEach(function (elem) {
            scope.remove(elem);
        });

        return items.length;

    },

    getKey : function (field, value) {
        if (this.config.indexFields[field].discrete) {
            var step = this.config.indexFields[field].step;
            return this.getDiscreteValue(value, step);
        } else {
            return value;
        }
    },

    getDiscreteValue : function (value, step) {
        return Math.round(value /  step) * step;
    },

    loadFromData : function (data) {
        if (!data || !data.length) {
            throw new Error("Data must be non empty array of objects");
        }
        var scope = this;

        data.forEach(function (row) {
            scope.addRow(row);
        });
    },

    dump : function () {
        return JSON.stringify(this.data.indexed);
    },

    dumpToMysql : function () {

    }

};

module.exports = Storage;
