var budgetController = (function(){
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);

        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    // this will just calculate the expenses and the income
    calculateTotals = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        })

        data.totals[type] = sum; 
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp:0,
            inc:0
        },
        budget: 0,
        percentage:0
    }

    return{
        addItem: function (type, des , val) {
            var newItem, ID;

            //creating new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }

            //creating new items
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //storing newItem to the exp or inc arry
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, ID){
            var ids, index;
            
            //make an array for all ids of inc and exp
            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(ID);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            } 

        },

        calculateBudget: function () {
            // calculate the sum of total income and expenses
            // for sum calculation we will use another private function
            calculateTotals('exp');
            calculateTotals('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            } else{
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function () {
          data.allItems.exp.forEach(function(cur){
            cur.calcPercentage(data.totals.inc);
          })  
        },

        getPercentages: function () {
          var allPerc = data.allItems.exp.map(function(cur){
              return cur.getPercentage();
          })  ;

          return allPerc;
        },

        getBudget : function () {
            return {
                budget: data.budget,
                totalinc: data.totals.inc,
                totalexp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    }

})();

var UIController = (function(){

    var DOMString = {
         inputType: '.add__type',
         inputDescription: '.add__description',
         inputValue: '.add__value',
         inputBtn: '.add__btn',
         incomeContainer: '.income__list',
         expensesContainer: '.expenses__list',
         budgetLabel: '.budget__value',
         incomeLabel: '.budget__income--value',
         expensesLabel: '.budget__expenses--value',
         percentageLabel: '.budget__expenses--percentage',
         container: '.container',
         expensesPercLabel: '.item__percentage',
         dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;

        num = Math.abs(num); //this will remove the sign
        num = num.toFixed(2); // It will round of or add two decimal number . It return string

        numSplit = num.split('.'); // It split the string at '.'
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3);
        };
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec ;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length ; i++ ){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                 type: document.querySelector(DOMString.inputType).value,
                 description: document.querySelector(DOMString.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        },
        addListItem: function(obj, type){
            var html, newHtml, element;

            //creating new string with place holder
            if (type == 'inc') {
                element = DOMString.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"></div><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div></div>'
            } else if (type =='exp') {
                element = DOMString.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // replacing the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert 'html' to the html file
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItems: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMString.inputDescription + ',' + DOMString.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

          document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget, type);  
          document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.totalinc, 'inc');  
          document.querySelector(DOMString.expensesLabel).textContent = formatNumber(obj.totalexp, 'exp'); 
          
          if(obj.percentage > 0){
            document.querySelector(DOMString.percentageLabel).textContent = obj.percentage + '%';
          } else{
            document.querySelector(DOMString.percentageLabel).textContent = '--';
          }
            
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMString.expensesPercLabel);

           

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '--';
                }
            });
        },

        displayMonth: function(){
            var now, months, month, year;

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May' , 'June', 'Julay', 
            'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMString.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType : function(){
            var fields = document.querySelectorAll(
                DOMString.inputType + ',' +
                DOMString.inputDescription + ',' +
                DOMString.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.inputBtn).classList.toggle('red');
            // var nodeListForEach = function(list, callback){
            //     for(var i = 0; i < list.length ; i++ ){
            //         callback(list[i], i);
            //     }
            // };

            //console.log(fields);
        },

        getDOMString: function(){
            return DOMString;
        }
    }

})();

var controller = (function(budgetCtrl, UICtrl){

    var setEventListeners = function(){
        var DOM = UICtrl.getDOMString();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
             if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function () {

        //1.calculate budget
        budgetCtrl.calculateBudget();

        //2. return the budget
        var budget = budgetCtrl.getBudget();

        //3. update ui
        UICtrl.displayBudget(budget); 
    };

    var updatePercentages = function () {
      //1. calculate percentages
      budgetCtrl.calculatePercentages();
      
      //2. Read percentages from the budget
      var percentages = budgetCtrl.getPercentages();

      //3. update the ui
      UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        //1.get the field input data
        var input = UIController.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            //2.add the new item to the data structure
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3.add the new item to the ui
            UICtrl.addListItem(newItem, input.type);

            //4. clear fields
            UICtrl.clearFields();

            //5. update budget
            updateBudget();

            //6. update percentages
            updatePercentages();
        }

        
    }

    var ctrlDeleteItem = function(event){
        var itemID, splitID;

        // getting the id of the each item in income or expenses column
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

         if (itemID) {
             splitID = itemID.split('-');
             type = splitID[0];
             ID = parseInt(splitID[1]);
         };
        console.log(itemID);

        //1. delete the data from the data structure
        budgetCtrl.deleteItem(type, ID);

        //2. delete the item from the UI
        UICtrl.deleteListItems(itemID);

        //3. update and show the new budget
        updateBudget();

        //4. update percentages
        updatePercentages();

    } 
    
return {
    init: function(){
        console.log('I am runnig');
        UICtrl.displayMonth();
        UICtrl.displayBudget({
            budget: 0,
            totalinc: 0,
            totalexp: 0,
            percentage: -1
        }); 
        setEventListeners();
    }
}
})(budgetController, UIController);


controller.init(); 




