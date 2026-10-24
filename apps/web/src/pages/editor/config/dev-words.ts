import type { Language } from "@shared/i18n";

export interface Words {
  readonly start: string;
  readonly end: string;
  readonly yes: string;
  readonly no: string;
  readonly input: string;
  readonly output: string;
  readonly cheques: string;
  readonly checkDetails: string;
  readonly keyIn: string;
  readonly register: string;
  readonly masterFile: string;
  readonly receipts: string;
  readonly sortBlank: string;
  readonly blankList: string;
  readonly order: string;
  readonly displayData: string;
  readonly customerFile: string;
  readonly stockFile: string;
  readonly orderFile: string;
  readonly tempFile: string;
  readonly invoices: string;
  readonly isOrder: string;
  readonly query: string;
  readonly validate: string;
  readonly processOrder: string;
  readonly makeInvoices: string;
  readonly loadList: string;
  readonly total: string;
  readonly pause: string;
  readonly note: string;
  readonly noteDetail: string;
  readonly stage: string;
  readonly detail: string;
  readonly detailBegin: string;
  readonly detailEnd: string;
  readonly step: string;
  readonly reportWest: string;
  readonly reportEast: string;
  readonly reports: string;
  readonly forms: string;
  readonly request: string;
  readonly call: string;
  readonly event: string;
  readonly channel: string;
  readonly sensor: string;
  readonly keyboard: string;
  readonly screen: string;
  readonly route: string;
  readonly flightPlans: string;
  readonly timer: string;
  readonly fetch: string;
  readonly parse: string;
  readonly retry: string;
  readonly fail: string;
  readonly ok: string;
  readonly cache: string;
  readonly auth: string;
  readonly deliver: string;
  readonly toPage: string;
  readonly fromPage: string;
  readonly whole: string;
  readonly part: string;
  readonly unknownTimes: string;
  readonly tape: string;
  readonly transferPermanent: string;
  readonly transferTemporary: string;
  readonly transferInterrupt: string;
}

export const WORDS: Readonly<Record<Language, Words>> = {
  en: {
    start: "Start",
    end: "End",
    yes: "Yes",
    no: "No",
    input: "Input",
    output: "Output",
    cheques: "Bank cheques",
    checkDetails: "Check details and fix errors",
    keyIn: "Enter customer number and amount",
    register: "Register receipts",
    masterFile: "Master file",
    receipts: "Ticket sales receipts",
    sortBlank: "Re-sort blank cheques to be returned",
    blankList: "List of blank cheques",
    order: "Start of order",
    displayData: "Display data",
    customerFile: "Customer file",
    stockFile: "Stock file",
    orderFile: "Accepted orders file",
    tempFile: "Temporary customer file",
    invoices: "Invoices",
    isOrder: "Order or query?",
    query: "Query",
    validate: "Check data, query stock, allocate goods",
    processOrder: "Process order",
    makeInvoices: "Process invoices",
    loadList: "Load the list",
    total: "Add up the totals",
    pause: "Wait for the answer",
    note: "Runs once a day",
    noteDetail: "Stops the program;<br/>restart by hand",
    stage: "Stage",
    detail: "Detailed in another sheet",
    detailBegin: "Begin",
    detailEnd: "End",
    step: "Step",
    reportWest: "Western zone report",
    reportEast: "Eastern zone report",
    reports: "Zone reports",
    forms: "Forms",
    request: "request",
    call: "call",
    event: "event",
    channel: "Radio channel",
    sensor: "Sensor data",
    keyboard: "Keyboard",
    screen: "Screen",
    route: "Route",
    flightPlans: "Flight plans",
    timer: "Real-time timer",
    fetch: "Fetch page",
    parse: "Parse page",
    retry: "Retry",
    fail: "Failed",
    ok: "Done",
    cache: "Cache",
    auth: "Sign in",
    deliver: "Deliver result",
    toPage: "To sheet 3",
    fromPage: "From sheet 1",
    whole: "Whole run",
    part: "One part",
    unknownTimes: "Any number of times",
    tape: "Archive tape",
    transferPermanent: "transfer of control (permanent)",
    transferTemporary: "transfer of control (temporary)",
    transferInterrupt: "transfer of control (interrupt)",
  },
  uk: {
    start: "Початок",
    end: "Кінець",
    yes: "Так",
    no: "Ні",
    input: "Введення",
    output: "Виведення",
    cheques: "Банківські чеки",
    checkDetails: "Перевірити дані та виправити помилки",
    keyIn: "Ввести номер клієнта та суму",
    register: "Зареєструвати надходження",
    masterFile: "Головний файл",
    receipts: "Надходження від продажу квитків",
    sortBlank: "Пересортувати порожні чеки, що підлягають поверненню",
    blankList: "Список порожніх чеків",
    order: "Початок замовлення",
    displayData: "Дані відображення",
    customerFile: "Файл покупця",
    stockFile: "Файл товарів, внесених в опис",
    orderFile: "Файл прийнятих замовлень",
    tempFile: "Тимчасовий файл замовника",
    invoices: "Рахунки",
    isOrder: "Замовлення чи запит?",
    query: "Запит",
    validate: "Контроль даних, запит опису, розподіл товарів",
    processOrder: "Обробка замовлення",
    makeInvoices: "Обробка накладних",
    loadList: "Завантажити список",
    total: "Підсумувати суми",
    pause: "Чекати на відповідь",
    note: "Виконується раз на добу",
    noteDetail: "Зупинка програми;<br/>перезапуск вручну",
    stage: "Етап",
    detail: "Деталізовано на іншому аркуші",
    detailBegin: "Початок",
    detailEnd: "Кінець",
    step: "Крок",
    reportWest: "Звіт західної зони",
    reportEast: "Звіт східної зони",
    reports: "Звіти зон",
    forms: "Бланки",
    request: "запит",
    call: "виклик",
    event: "подія",
    channel: "Радіоканал",
    sensor: "Дані датчиків",
    keyboard: "Клавіатура",
    screen: "Дисплей",
    route: "Маршрут",
    flightPlans: "Польотні плани",
    timer: "Таймер реального часу",
    fetch: "Завантажити сторінку",
    parse: "Розібрати сторінку",
    retry: "Повторити",
    fail: "Помилка",
    ok: "Готово",
    cache: "Кеш",
    auth: "Увійти",
    deliver: "Передати результат",
    toPage: "До арк. 3",
    fromPage: "З арк. 1",
    whole: "Весь запуск",
    part: "Одна частина",
    unknownTimes: "Довільна кількість разів",
    tape: "Архівна стрічка",
    transferPermanent: "передача керування (постійна)",
    transferTemporary: "передача керування (тимчасова)",
    transferInterrupt: "передача керування (переривання)",
  },
};
