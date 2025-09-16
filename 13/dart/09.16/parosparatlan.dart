import 'dart:io';
import 'dart:math';

void main() {
    stdout.write('Adj meg egy egész számot: ');
    int? szam = int.tryParse(stdin.readLineSync() ?? '');

    if (szam == null) {
        print('Érvénytelen szám.');
        return;
    }

    // Páros vagy páratlan
    if (szam % 2 == 0) {
        print('A szám páros.');
    } else {
        print('A szám páratlan.');
    }

    // Pozitív, nulla vagy negatív
    if (szam > 0) {
        print('A szám pozitív.');
    } else if (szam == 0) {
        print('A szám nulla.');
    } else {
        print('A szám negatív.');
    }

    // Négyzetszám-e
    int gyok = sqrt(szam.abs()).toInt();
    if (szam >= 0 && gyok * gyok == szam) {
        print('A szám négyzetszám.');
    } else {
        print('A szám nem négyzetszám.');
    }
}