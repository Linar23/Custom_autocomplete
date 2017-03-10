$(document).ready(function () {
    var inputClicked = false;
    var selectedListIndex = 0;
    var isPopularCityList = false;
    var isValidationRed = false;

    // Очистка списка городов
    function clearList() {
        $('.list').empty();
    }

    function removeValidation() {
        $('.autocomplete #inputCity').removeClass('validated');
        $("#textValidation").remove();
        isValidationRed = false;
    }

    // Выбор первого элемента в списке
    function firstElementSelect() {
        if ($('.list #Element').length != 0) {
            selectedListIndex = 0;
            $('.list #Element').eq(0).addClass('selected');
        };
    }

    // Проверка входных данных
    function checkInput(input) {
        l = 0;
        for (i = 0; i < input.length; i++) {
            if (input[i] == ' ') {
                l++;
            }
        }
        if (l != input.length) {
            return true;
        }
        else {
            return false;
        }
    }

    // Список популярных городов
    function addPopularCity() {
        $(".list").append('<div id="topTipElement">' + 'Популярные города' + '</div>');
        $(".list").append('<div id="popularListElement">' + 'Бавлы' + '</div>');
        $(".list").append('<div id="popularListElement">' + 'Белорецк' + '</div>');
        $(".list").append('<div id="popularListElement">' + 'Вятские Поляны' + '</div>');
        isPopularCityList = true;
    }

    // Выпадание списка городов при клике на input
    $('.autocomplete #inputCity').on('click', function () {
        $('.autocomplete #inputCity').select();
        removeValidation();
        if (!inputClicked) {
            $('.list').addClass('open');
            addPopularCity();
            inputClicked = true;
        };
    });

    // Обработка ввода значений в input
    $('.autocomplete #inputCity').on('input', function () {
        if (checkInput($(this).val())) {
            clearList();
            selectedListIndex = 0;
            isPopularCityList = false;
            isValidationRed = false;
            if ($(this).val() != '') {
                $('.list').addClass('open');
                getListAJAX();
                firstElementSelect();
            }
        }
        else {
            clearList();
            $('.list').addClass('open');
            addPopularCity();
        };
    });

    // Обработка нажатия клавиш
    $('.autocomplete #inputCity').keydown(function handle(eventObject) {
        // Если list не пустой,то: 
        if ($('.list #Element').length != 0) {
            if (eventObject.keyCode == 40) { // down   
                if (selectedListIndex != ($('.list #Element').length - 1)) {
                    $('.list #Element').eq(selectedListIndex).removeClass('selected');
                    $('.list #Element').eq(selectedListIndex + 1).addClass('selected');
                    selectedListIndex++;
                };
            };
            if (eventObject.keyCode == 38) { // up  
                if (selectedListIndex != 0) {
                    $('.list #Element').eq(selectedListIndex).removeClass('selected');
                    selectedListIndex--;
                    $('.list #Element').eq(selectedListIndex).addClass('selected');
                };
                return false;
            };
            if (eventObject.keyCode == 39) { // right
                return false;
            };
            if (eventObject.keyCode == 37) { // left                          
                return false;
            };
        };
        if (eventObject.keyCode == 9) { // tab                         
            clearList();
            $('.list').removeClass('open');
            $('.autocomplete #inputCity').blur();
            inputClicked = false;
            // Переход к следующему контролу, которого пока нет
            return false;
        };
        if (eventObject.keyCode == 13) // enter
        {
            if ($('.list #Element').length == 0) {
                if ($('.autocomplete #inputCity').val() != "") {
                    sendToServerAJAX();
                    $('.autocomplete #inputCity').blur();
                };
            }
            else {
                sendToServerFromListAJAX(selectedListIndex);
                $('.autocomplete #inputCity').val($('.list #Element').eq(selectedListIndex).text());
                clearList();
                $('.list').removeClass('open');
                $('.autocomplete #inputCity').blur();
                // Переход к следующему контролу, которого пока нет
            };
        };
    });

    // Обработка кликов
    $('html').click(function (e) {
        if ((!$(e.target).is('.autocomplete #inputCity')) && (!$(e.target).is('.list')) && (!$(e.target).is('.list #Element'))) {
            clearList();
            $('.list').removeClass('open');
            $('.autocomplete #inputCity').blur();
            inputClicked = false;
            if ($('.autocomplete #inputCity').val() != "") {
                if (!isValidationRed) {
                    $('.autocomplete #inputCity').addClass('validated');
                    $('.autocomplete').append('<div id="textValidation">Добавьте значение в справочник или выберите другое значение из списка</div>');
                };
                isValidationRed = true;
            };
        }
        else {
            $('.autocomplete #inputCity').focus();
        };
    });
});

// Получаем данные с сервера и добавляем в list
function getListAJAX() {
    var data = {
        'input': $('.autocomplete #inputCity').val(),
    };

    $.ajax({
        async: false,
        type: "POST",
        url: "Page_autocomplete.aspx/SearchingWebMethod",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            $(".list").append('<div id="loader"><img src="tail-spin.svg" />Загрузка</div>');
        },
        success: function (response) {
            var myData = response.d;
            $(".list #loader").remove();
            if (myData.length == 0) {
                $(".list").removeClass('open');
            }
            else {
                for (var i = 0; i < myData.length; i++) {
                    if (i > 4) {
                        $(".list").append('<div id="bottomTipElement">' + myData[i].City + '</div>');
                    }
                    else {
                        $(".list").append('<div id="Element">' + myData[i].City + '</div>');
                    }
                };
            };
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.responseText);
        }
    });
};

// Отправляем новое значение из input на сервер
function sendToServerAJAX() {
    var data = {
        'input': $('.autocomplete #inputCity').val(),
    };

    $.ajax({
        async: false,
        type: "POST",
        url: "Page_autocomplete.aspx/GetCityFromInput",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.responseText);
        }
    });
};

// Отправляем на сервер выбранное значение из списка
function sendToServerFromListAJAX(selectedListIndex) {
    var data = {
        'input': $('.list #Element').eq(selectedListIndex).text(),
    };

    $.ajax({
        async: false,
        type: "POST",
        url: "Page_autocomplete.aspx/GetCityFromList",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.responseText);
        }
    });
};