function is_hokushin(str) {
    let num = Number.parseInt(str);

    if (60 <= num && num < 90)
        return true;
    else 
        return false;
    
}

function is_tanigami_shukko(str) {
    let num = Number.parseInt(str);

    if (25 <= num && num < 30)
        return true;
    else
        return false;
}