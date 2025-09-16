import 'dart:io';
import 'dart:math';

void main()
{


stdout.write('Adj meg egy egész számot: ');
int? szam = int.tryParse(stdin.readLineSync() ?? '');

if (szam == null) {
    print('Érvénytelen szám!');
    return;
}

// Páros vagy páratlan
if (szam % 2 == 0) {
    print('A szám páros.');
} else {
    print('A szám páratlan.');
}

// If: osztályzat kiírása
if (szam == 1) {
    print('Elégtelen');
} else if (szam == 2) {
    print('Elégséges');
} else if (szam == 3) {
    print('Közepes');
} else if (szam == 4) {
    print('Jó');
} else if (szam == 5) {
    print('Jeles');
} else {
    print('Érvénytelen osztályzat');
}

// Switch: osztályzat kiírása
switch (szam) {
    case 1:
        print('Elégtelen ');
        break;
    case 2:
        print('Elégséges ');
        break;
    case 3:
        print('Közepes ');
        break;
    case 4:
        print('Jó ');
        break;
    case 5:
        print('Jeles ');
        break;
    default:
        print('Érvénytelen osztályzat ');
}

// Assert: 1 és 5 között legyen
assert(szam >= 1 && szam <= 5, 'A szám nem megfelelő osztályzat (1-5 között kell lennie)!');
}