$(document).ready(function () {
    var inputFocused = false; // Input в фокусе
    var selectedListIndex = 0; // Выбранное значение списка городов
    var isValidationRed = false; // Валидировано
    var isIE = false; // Internet Explorer
    var isSended = false; // Отправлено на сервер
    var onHoverIndex = -1; // Выделенный мышкой элемент списка городов
    var isOnAppendElement = false; // На элементе "добавить"
    var firstTimeClicked = false; // Переменная чтобы отследить первый клик,потому что IE считает клик за изменение значения input

    // Кроссбраузерность
    function SpeciallyForIE() {
        // Получаем название браузера
        var ua = navigator.userAgent;
        // Если IE
        if (ua.search(/.NET/) > 0) {
            $('.autocomplete').append('<input id="inputCity" placeholder="Начните вводить код или название" autocomplete="off">');
            isIE = true;
        }
        else {
            $('.autocomplete').append('<input id="inputCity" placeholder="Начните вводить код или название" autocomplete="off" onkeypress="return handle(event)">');
            isIE = false;
        };
    }

    SpeciallyForIE();

    // Выполняем очистку после отправки
    function AfterSendFunction() {
        $('.autocomplete #inputCity').val("");
        AddAppendElement();
        isSended = false;
    };

    // Очистка списка городов
    function ClearList() {
        $('.list').empty();
        $('.list').removeClass('open');
    }

    // Удаление стиля валидации
    function RemoveValidation() {
        $('.autocomplete #inputCity').removeClass('validated');
        $("#textValidation").remove();
        isValidationRed = false;
    }

    // Выбор первого элемента в списке
    function SelectFirstElement() {
        if ($('.list #Element').length != 0) {
            selectedListIndex = 0;
            $('.list #Element').eq(0).addClass('selected');
        }
        // Если есть только элемент "добавить",то выделяем его
        else if ($('.list').length == 1) {
            $('.list #appendElement').addClass('selected');
        };
    }

    // Проверка входных данных на корректность
    function CheckInput(input) {
        l = 0;
        // Считаем пробелы
        for (i = 0; i < input.length; i++) {
            if (input[i] == ' ') {
                l++;
            }
        };        
        if (l != input.length) {
            return true;
        }
        else {
            return false;
        }
    }

    // Элемент добавить
    function AddAppendElement() {
        $(".list").append('<div id="appendElement">' + "+ Добавить  " + $('.autocomplete #inputCity').val() + '</div>');
        $('.list #appendElement').addClass('selected');
        $('.list').addClass('open');
    }

    // Обработка работы с мышью
    $('.list').on("mouseenter", "#appendElement", function () {
        $('.list #Element').eq(selectedListIndex).removeClass('selected');
        $('.list #appendElement').addClass('selected');
        isOnAppendElement = true;
    });

    $('.list').on("mouseleave", "#appendElement", function () {
        if ($('.list #Element').length == 0) {
            $('.list #appendElement').addClass('selected');
        }
        else {
            $('.list #appendElement').removeClass('selected');
            $('.list #Element').eq(selectedListIndex).addClass('selected');
        };
        isOnAppendElement = false;
    });

    $('.list').on("mouseenter", "#Element", function () {
        $('.list #Element').eq(selectedListIndex).removeClass('selected');
        $('.list #Element').eq(selectedListIndex).addClass('selected-gray');
        $(this).addClass('selected');
        onHoverIndex = $(this).index();
        if (onHoverIndex == selectedListIndex) {
            $('.list #Element').eq(selectedListIndex).removeClass('selected-gray');
            $('.list #Element').eq(selectedListIndex).addClass('selected');
        };
    });

    $('.list').on("mouseleave", "#Element", function (e) {
        $('.list #Element').eq(onHoverIndex).removeClass('selected');
        $('.list #Element').eq(selectedListIndex).removeClass('selected-gray');
        $('.list #Element').eq(selectedListIndex).addClass('selected');
    });

    // Выпадание списка городов при клике на input
    $('.autocomplete #inputCity').on('click', function () {
        // Если валидировано, удаляем стиль валидации
        if (isValidationRed) {
            RemoveValidation();
        };
        // Если отправляли на сервер, то очищаем input
        if (isSended) {
            AfterSendFunction();
        };
        // Если был потерян фокус и произошел клик
        if (!inputFocused) {
            $('.autocomplete #inputCity').select();
            inputFocused = true;
            // Если input непустой, то показываем результат запроса
            if ($('.autocomplete #inputCity').val() != "") {
                $('.list').addClass('open');
                GetListAJAX();
                SelectFirstElement();
            }
            // Если input пустой, то добавляем элемент списка "добавить"
            else {
                AddAppendElement();
            };
        };
    });

    // Обработка ввода значений в input
    $('.autocomplete #inputCity').on('input', function () {     
        // Если input непустой
        if ($(this).val() != "") {
            // Делаем проверку input на корректность ввода
            if (CheckInput($(this).val())) {
                ClearList();
                selectedListIndex = 0;
                $('.list').addClass('open');
                GetListAJAX();
                if ($('.list #Element').length == 0) {
                    $('.list #appendElement').addClass('selected');
                };
                SelectFirstElement();
            };
        }
        // Если input пустой
        else {
            ClearList();
            if (!isIE) {
                AddAppendElement();
            }
            else if (firstTimeClicked) {
                AddAppendElement();
                firstTimeClicked = true;
            };
        };
    });

    // Обработка нажатия клавиш
    $('.autocomplete #inputCity').keydown(function handle(eventObject) {
        // Если список городов не пустой,то: 
        if ($('.list #Element').length != 0) {
            if (eventObject.keyCode == 40) { // вниз   
                if (selectedListIndex != ($('.list #Element').length - 1)) {
                    $('.list #Element').eq(onHoverIndex).removeClass('selected');
                    $('.list #Element').eq(selectedListIndex).removeClass('selected-gray');
                    $('.list #Element').eq(selectedListIndex).removeClass('selected');
                    $('.list #Element').eq(selectedListIndex + 1).addClass('selected');
                    selectedListIndex++;
                };
            }
            else if (eventObject.keyCode == 38) { // вверх  
                if (selectedListIndex != 0) {
                    $('.list #Element').eq(onHoverIndex).removeClass('selected');
                    $('.list #Element').eq(selectedListIndex).removeClass('selected-gray');
                    $('.list #Element').eq(selectedListIndex).removeClass('selected');
                    selectedListIndex--;
                    $('.list #Element').eq(selectedListIndex).addClass('selected');
                };
                return false;
            }
            else if (eventObject.keyCode == 39) { // вправо
                return false;
            }
            else if (eventObject.keyCode == 37) { // влево                          
                return false;
            };
        };
        if (eventObject.keyCode == 9) { // tab  
            ClearList();
            $('.autocomplete #inputCity').blur();
            inputFocused = false;
            // Переход к следующему контролу, которого пока нет
            return false;
        };
        if (eventObject.keyCode == 27) { // esc  
            $('.list').removeClass('open');
            return false;
        };
        if (eventObject.keyCode == 13) // enter
        {
            isSended = true;
            // Если результат поиска пустой,то ввод нового значения
            if ($('.list #Element').length == 0) {
                if ($('.autocomplete #inputCity').val() != "") {
                    SendToServerFromInputAJAX();
                    $('.autocomplete #inputCity').blur();
                    ClearList();
                };
            }
                // Иначе отправляем выбранный результат на сервер
            else {
                SendToServerFromListAJAX(selectedListIndex);
                $('.autocomplete #inputCity').val($('.list #Element').eq(selectedListIndex).text());
                ClearList();
                $('.autocomplete #inputCity').blur();
                // Переход к следующему контролу, которого пока нет
            };
        };
    });

    // Элемент обновить
    $('#refreshElement').click(function () {
        ClearList();
    });

    // Обработка кликов
    $('html').click(function (e) {
        // Если кликаем куда-то кроме рабочей области
        if ((!$(e.target).is('.autocomplete #inputCity')) && (!$(e.target).is('.list')) && (!$(e.target).is('.list #Element')) && (!$(e.target).is('.list #appendElement'))) {
            ClearList();
            $('.autocomplete #inputCity').blur();
            inputFocused = false;
            // Если при этом input непустой,валидируем
            if ($('.autocomplete #inputCity').val() != "") {
                if (!isValidationRed && !isSended) {
                    $('.autocomplete #inputCity').addClass('validated');
                    $('.autocomplete').append('<div id="textValidation">Добавьте значение в справочник или выберите значение из списка</div>');
                };
                isValidationRed = true;
            };
        }
        else {
            // Если input в фокусе
            if (inputFocused) {
                // Если кликаем по выбранному элементу списка городов
                if (($(e.target).hasClass('selected')) && !isOnAppendElement) {
                    isSended = true;
                    SendToServerFromListAJAX($(e.target).index());
                    $('.autocomplete #inputCity').val($('.list #Element').eq($(e.target).index()).text()); // Добавляем в input выбранное кликом значение
                    ClearList();
                    $('.autocomplete #inputCity').blur();
                }
                // Если кликаем по элементу "добавить"
                else if (isOnAppendElement) {
                    if (CheckInput($('.autocomplete #inputCity').val())) {
                        isOnAppendElement = false;
                        SendToServerFromInputAJAX();
                        isSended = true;
                        ClearList();
                        $('.autocomplete #inputCity').blur();
                    }
                    // Если проверку не прошло,то просто фокусируем
                    else {
                        $('.autocomplete #inputCity').focus();
                    };
                }
                // Иначе просто фокусируем
                else {
                    $('.autocomplete #inputCity').focus();
                };
            }
            // Если input не в фокусе,выделяем то что в input
            else {
                $('.autocomplete #inputCity').select();
            };
        };
    });

    // Получаем данные с сервера и добавляем в list
    function GetListAJAX() {
        var data = {
            'input': $('.autocomplete #inputCity').val(),
        };

        // Лоадер
        $(".list").append('<div id="loader"><img src="tail-spin.svg" />Загрузка</div>');
        
        $.ajax({
            async: false,
            type: "POST",
            url: "Page_autocomplete.aspx/SearchingWebMethod",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                var myData = response.d;
                $(".list #loader").remove();
                // Если сервера пришел пустой список
                if (myData.length == 0) {
                    $(".list").append('<div id="appendElement">' + "+ Добавить  «" + $('.autocomplete #inputCity').val() + '»' + '</div>');
                }
                // Если с сервера пришел непустой список
                else {
                    for (var i = 0; i < myData.length; i++) {
                            $(".list").append('<div id="Element">' + myData[i].City + '</div>');
                    };
                    $(".list").append('<div id="appendElement">' + "+ Добавить  «" + $('.autocomplete #inputCity').val() + '»' + '</div>');
                };

            },
            // Обработка ошибок запроса
            error: function () {
                isSended = true;
                $(".list #loader").remove();
                $(".list").append('<div id="errorElement">' + "Что-то пошло не так.Проверьте соединение с интернетом и попробуйте еще раз" + '</div>');
                $(".list").append('<div id="refreshElement">' + "Обновить" + '</div>');
            }
        });
    };

    // Отправляем новое значение из input на сервер и добавляем в json
    function SendToServerFromInputAJAX() {
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
            // Обработка ошибок запроса
            error: function () {
                isSended = true;
                $(".list #loader").remove();
                $(".list").append('<div id="errorElement">' + "Что-то пошло не так.Проверьте соединение с интернетом и попробуйте еще раз" + '</div>');
                $(".list").append('<div id="refreshElement">' + "Обновить" + '</div>');
            }
        });
    };

    // Отправляем на сервер выбранное мышкой или нажатием на Enter значение из списка
    function SendToServerFromListAJAX(selectedListIndex) {
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
            // Обработка ошибок запроса
            error: function () {
                isSended = true;
                $(".list #loader").remove();
                $(".list").append('<div id="errorElement">' + "Что-то пошло не так.Проверьте соединение с интернетом и попробуйте еще раз" + '</div>');
                $(".list").append('<div id="refreshElement">' + "Обновить" + '</div>');
            }
        });
    };
});