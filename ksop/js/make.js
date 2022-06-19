// htmlを作る関数群

function make_rows(sta_name, day_name, direction) {
    let result = `
<tr>
    <th>時</th>
    <th>${sta_name}駅 ${day_name}ダイヤ ${direction}</th>
</tr>
`;

    for (let i = 5; i <= 23; i++ )
        result += `
        <tr id="row-${i}">
            <td class="hour">${i}</td>
            <td id="hour-train-${i}" class="trains"></td>
        </tr>
        `;

    for (let i = 0; i <= 1; i++ )
        result += `
        <tr id="row-${i}">
            <td class="hour">${i}</td>
            <td id="hour-train-${i}" class="trains"></td>
        </tr>
        `;

    return result;
}

function make_train(train, sta_id) {
    if (train.jikoku[sta_id] == null)
        return "";

    // 適用させる属性
    let classes = "";
    if (train.destcode == "Shinkobe") // 新神戸行(下線)
        classes += "dest-shinkobe ";
    else if (train.destcode == "Myodani") // 名谷行(枠)
        classes += "dest-myodani ";
    if (is_hokushin(train.unban)) // 北神車
        classes += "car-hokushin ";
    else if (is_tanigami_shukko(train.unban)) // 谷上出庫車
        classes += "car-tanigami ";

    let result = `
    <span class="train">
        <span class="${classes}">${train.jikoku[sta_id].minute}</span>
        <span class="train-op">${train.unban}</span>
        <span class="train-id">${train.retsuban}</span>
    </span>
    `;

    return result;
}

// 指定時の領域に上書き
function set_html(hour, inner) {
    document.getElementById(`hour-train-${hour}`)
        .innerHTML = inner;
}

// 指定時に指定駅を発車の一覧を取得
function get_hour_train(hour, sta_id, trains) {
    let result = [];
    trains.forEach(train => {
        if (train.jikoku[sta_id] != null)
        if (Number.parseInt(train.jikoku[sta_id].hour) == hour)
            result.push(train);
    });

    return result;
}

function make_hour_train(hour, sta_id, trains) {
    let result = "";

    get_hour_train(hour, sta_id, trains).forEach(train => {
        result += make_train(train, sta_id);
    });

    return result;
}

function draw_all_hour_train(sta_id, trains) {
    let hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];
    hours.forEach(i => {
        set_html(i, make_hour_train(i, sta_id, trains));
    })
}

function reset(sta_id, is_holiday, is_east) {
    let staname = [
        "谷上", "新神戸", "三宮", "県庁前",
        "大倉山", "湊川公園", "上沢", "長田",
        "新長田", "板宿", "妙法寺", "名谷",
        "総合運動公園", "学園都市", "伊川谷",
        "西神南", "西神中央",
    ];

    let day = "";
    if (is_holiday)
        day = "休日";
    else
        day = "平日";

    let direction = "";
    if (is_east)
        direction = "東行";
    else
        direction = "西行";

    document.getElementById("jikoku-table").innerHTML
        = make_rows(staname[sta_id], day, direction);

    if (!is_holiday && !is_east) { // 平日西行
        draw_all_hour_train(sta_id, data_weekday_west);
    } else if (!is_holiday && is_east) { // 平日東行
        draw_all_hour_train(sta_id, data_weekday_east);
    } else if (is_holiday && !is_east) { // 休日西行
        draw_all_hour_train(sta_id, data_holiday_west);
    } else if (is_holiday && is_east) { // 休日東行
        draw_all_hour_train(sta_id, data_holiday_east);
    }
}