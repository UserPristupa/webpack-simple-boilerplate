# Начальный шаблон для frontend проектов

## Для того, чтобы запустить проект, выполните следующие команды:
```
npm i
npm run start
```
проект будет доступен по локальному адресу [http://localhost:8080](http://localhost:8080)
##### В данной конфигурации Webpack добавлен плагин для "горячего обновления" браузера это означает, что после запуска проекта вам не нужно будет, после очередного изменения кода, обновлять страницу браузера для того что бы увидеть результат ваших изменений, все файлы пересоберутся автоматически, и браузер обновит страницу автоматически.

## Для того, чтобы сделать сборку проекта для рабочего сервера, нужно выполнить следующую команду:
```
npm run build
```
в папке `./dist` появятся оптимизированные файлы.

---

Установки дополнительных библиотек для использования в проекте:
- для библиотек которые являются частью проекта:
```
npm install package-name --save
```
- для библиотек которые являются вспомогательными, т.е. для использования только во время разработки:
```
npm install package-name --save-dev
```

---

Шаблон проекта имеет следующую структуру папок и файлов:
```
.
├── README.md             - файл описания проекта, такое название и формат является типичным для большинства проектов разположенных на GitHub
├── package.json          - файл конфигурации пакетного менеджера NPM
├── src                   - папка в котором содержится исходный код проекта, по подпапкам разбит исходный код соответсвующих форматов
│   ├── images
│   ├── index.html        - "точка входа" для html файлов
│   ├── js
│   │   ├── data
│   │   │   └── users.js
│   │   └── index.js      - "точка входа" для JavaScript файлов
│   └── scss
│       └── style.scss    - "точка входа" для CSS файлов
└── webpack.config.js     - файл конфигурации пакетного менеджера NPM
```
* "Точка входа" означает, что именно эти файлы Webpack будет обрабатывать в первую очередь, все остальные файлы такого же формата будут обработаны только в случае если они будут "импортированы" в "главный" файл.
* В данном шаблоне проектов отсутсвует папка и файлы CSS. Тут применяется альтернативный формат - [SCSS](https://sass-scss.ru/). На самом деле, это так называемый [Синтаксический сахар](https://ru.wikipedia.org/wiki/%D0%A1%D0%B8%D0%BD%D1%82%D0%B0%D0%BA%D1%81%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%B0%D1%85%D0%B0%D1%80) для CSS. Вы можете при желании, использовать приемущества этого формата, но при этом, любой валидный CSS код, также является валидным SCSS кодом.

При работе над проектом с данной конфигурацией Webpack, подключать JS сценарии и CSS стили не нужно, так как это Webpack это делает вместо вас.
После запуска скрипта сборки для рабочего сервера, Webpack гренерирует все нужные файлы, и подключит соответсвующие CSS и JS файлы в HTML документ.
