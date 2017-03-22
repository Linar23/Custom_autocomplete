using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using Newtonsoft.Json;
using System.IO;

namespace Test_task
{
    public partial class Page : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        public static List<Kladr> SearchingMethod(List<Kladr> listKladr, string input, List<Kladr> listResult)
        {
            // Алгоритм для поиска по вхождению
            // Просматриваем все населенные пункты из json
            for (int i = 0; i < listKladr.Count(); i++)
            {
                // Распарсенное название населенного пункта
                string[] kladrItemParsed = listKladr[i].City.ToString().Split(' ', '-', '.', '"', '(', ')');

                // Распарсенная входная строка
                string[] inputParsed = input.ToString().Split(' ', '-', '.', '"', '(', ')');

                // Список для хранения индексов тех слов в названии населенного пункта, которые были уже найдены
                // чтобы их еще раз не проверять на вхождение
                List<int> indexFound = new List<int>();

                // Переменная - счетчик количества найденных слов в названии населенного пункта
                int wordFoundCounter = 0;

                // Просматриваем каждое слово в названии населенного пункта
                for (int l = 0; l < kladrItemParsed.Length; l++)
                {
                    // Просматриваем каждое слово во входной строке
                    for (int k = 0; k < inputParsed.Length; k++)
                        // Если слово из названия населенного пункта на вхождение найдено,то еще раз проверять не нужно
                        if (indexFound.Contains(l))
                        {
                            break;
                        }
                        else
                        {
                            // Если слово во входной строке непоследнее, 
                            // то нужно проверить его на полное вхождение
                            if (k < inputParsed.Length - 1)
                            {
                                if ((kladrItemParsed[l].ToLowerInvariant().StartsWith(inputParsed[k].ToLowerInvariant())))
                                {
                                    // Условие необходимое,чтобы узнать что слово просмотрено полностью
                                    if (inputParsed[k].Length == kladrItemParsed[l].Length)
                                    {
                                        wordFoundCounter++;
                                        // Если слово входной строки найдено в названии населенного пункта, то его можно удалить
                                        inputParsed[k] = "\0";
                                        // Добавляем индекс найденного слова в названии населенного пункта
                                        indexFound.Add(l);
                                        // Если просмотрели все слова,то добавляем в результат
                                        if (wordFoundCounter == inputParsed.Length)
                                        {
                                            listResult.Add(listKladr[i]);
                                            break;
                                        }
                                    }
                                }
                            }
                            // Если слово во входной строке последнее, то проверять на полное вхождение не нужно
                            else
                            {
                                if ((kladrItemParsed[l].ToLowerInvariant().StartsWith(inputParsed[k].ToLowerInvariant())))
                                {
                                    wordFoundCounter++;
                                    // Если слово входной строки найдено в названии населенного пункта, то его можно удалить
                                    inputParsed[k] = "\0";
                                    // Если просмотрели все слова,то добавляем в результат
                                    if (wordFoundCounter == inputParsed.Length)
                                    {
                                        listResult.Add(listKladr[i]);
                                        break;
                                    }
                                }
                            }
                        }
                }
            }
            return listResult;
        }

        public static List<Kladr> SelectFiveElements(List<Kladr> listResult,string input)
        {
            // Выборка 5 элементов из результатов поиска
            List<Kladr> resultFiveElements = new List<Kladr>();

            if (listResult.Count > 5)
            {
                for (int i = 0; i < 5; i++)
                {
                    resultFiveElements.Add(listResult[i]);
                }
            }
            else
            {
                resultFiveElements = listResult;
            };

            return resultFiveElements;
        }

        [WebMethod]
        public static List<Kladr> SearchingWebMethod(string input)
        {
            // Список для хранения всех населенных пунктов из kladr.json
            List<Kladr> listKladr = new List<Kladr>();
            // Список для хранения результатов поиска
            List<Kladr> listResult = new List<Kladr>();

            // Получаем путь до json файла
            string jsonPath = HttpContext.Current.Server.MapPath("~/kladr.json");
            // Считываем в переменную json файл
            string json = File.ReadAllText(jsonPath);
            // Десериализуем json файл
            listKladr = JsonConvert.DeserializeObject<List<Kladr>>(json);

            // Алгоритм поиска
            SearchingMethod(listKladr, input, listResult);

            // Выборка 5 элементов для отображения результатов
            return SelectFiveElements(listResult,input);
        }

        // Добавляем новый населенный пункт в базу
        [WebMethod]
        public static void GetCityFromInput(string input)
        {
            // Список для хранения всех населенных пунктов из kladr.json
            List<Kladr> listKladr = new List<Kladr>();

            // Получаем путь до json файла
            string jsonPath = HttpContext.Current.Server.MapPath("~/kladr.json");
            // Считываем в переменную json файл
            string json = File.ReadAllText(jsonPath);
            // Десериализуем json файл
            listKladr = JsonConvert.DeserializeObject<List<Kladr>>(json);

            // Переменная для хранения введенного значения
            Kladr inputKladr = new Kladr();
            inputKladr.Id = listKladr.Count().ToString();
            inputKladr.City = input;

            // Сериализуем объект
            string jsonPut = JsonConvert.SerializeObject(inputKladr, Formatting.Indented);

            // Создаем нужную структуру json файла
            var lines = File.ReadAllLines(jsonPath);
            File.WriteAllLines(jsonPath, lines.Take(lines.Length - 2));
            File.AppendAllText(jsonPath, "  },");
            File.AppendAllText(jsonPath, Environment.NewLine);

            File.AppendAllText(jsonPath, jsonPut);
            File.AppendAllText(jsonPath, Environment.NewLine);
            File.AppendAllText(jsonPath, "]");
        }

        // Получаем результат отправки формы
        [WebMethod]
        public static void GetCityFromList(string input)
        {
            string resultFromUser = input;

            // return resultFromUser;
        }
    }
}