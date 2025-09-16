import 'dart:io';
import 'dart:math';

void main()
{

int? szam1;
int? szam2;

while (true) {
    stdout.write('Adj meg egy egész számot: ');
    szam1 = int.tryParse(stdin.readLineSync() ?? '');

    stdout.write('Adj meg egy egész számot: ');
    szam2 = int.tryParse(stdin.readLineSync() ?? '');

    if (szam1 == null || szam2 == null) {
        print('Érvénytelen szám! Próbáld újra.');
        continue;
    }

    // Ha mindkét szám érvényes, kilépünk a ciklusból
    break;
}

if(szam1! > szam2!) {
    print('A nagyobb szám: $szam1');
} else if (szam2 > szam1) {
    print('A nagyobb szám: $szam2');
} else {
    print('A két szám egyenlő: $szam1');
}

int elteres = (szam1 - szam2).abs();
print("Eltérés: $elteres");
}