void main() {
  // Tesztelés
  print('=== String és szám megfordítás ===');
  print('reverseString("hello"): ${reverseString("hello")}');
  print('reverseInteger(123): ${reverseInteger(123)}');
  print('reverseNumber(123.45): ${reverseNumber(123.45)}');
  
  print('\n=== Számjegyek rendezése ===');
  print('sortNumbersAsc(3241): ${sortNumbersAsc(3241)}');
  print('sortNumbersDes(3241): ${sortNumbersDes(3241)}');
  
  print('\n=== FizzBuzz ===');
  print('fizzBuzz(15): ${fizzBuzz(15)}');
  print('fizzBuzz(9): ${fizzBuzz(9)}');
  print('fizzBuzz(10): ${fizzBuzz(10)}');
  print('fizzBuzz(7): ${fizzBuzz(7)}');
  
  print('\n=== Háromszög oldalak alapján ===');
  print('isTriangleBySides(3, 4, 5): ${isTriangleBySides(3, 4, 5)}');
  print('isTriangleBySides(1, 1, 3): ${isTriangleBySides(1, 1, 3)}');
  
  print('\n=== Háromszög szögek alapján ===');
  print('isTriangleByAngles(60, 60, 60): ${isTriangleByAngles(60, 60, 60)}');
  print('isTriangleByAngles(90, 45, 45): ${isTriangleByAngles(90, 45, 45)}');
  print('isTriangleByAngles(100, 50, 50): ${isTriangleByAngles(100, 50, 50)}');
  
  print('\n=== Háromszög típusa ===');
  print('triangleTypeByAngles(60, 60, 60): ${triangleTypeByAngles(60, 60, 60)}');
  print('triangleTypeByAngles(90, 45, 45): ${triangleTypeByAngles(90, 45, 45)}');
  print('triangleTypeByAngles(120, 30, 30): ${triangleTypeByAngles(120, 30, 30)}');
  
  print('\n=== Padovan számok ===');
  for (int i = 0; i <= 10; i++) {
    print('padovanNumber($i): ${padovanNumber(i)}');
  }
}

// 1. String megfordítása
String reverseString(String text) {
  return text.split('').reversed.join('');
}

// 2. Egész szám megfordítása
int reverseInteger(int integer) {
  bool isNegative = integer < 0;
  String numberStr = integer.abs().toString();
  String reversed = numberStr.split('').reversed.join('');
  int result = int.parse(reversed);
  return isNegative ? -result : result;
}

// 3. Szám megfordítása (tizedesjegyekkel)
double reverseNumber(double number) {
  bool isNegative = number < 0;
  String numberStr = number.abs().toString();
  
  if (numberStr.contains('.')) {
    List<String> parts = numberStr.split('.');
    String integerPart = parts[0].split('').reversed.join('');
    String decimalPart = parts[1].split('').reversed.join('');
    String reversed = '$integerPart.$decimalPart';
    double result = double.parse(reversed);
    return isNegative ? -result : result;
  } else {
    String reversed = numberStr.split('').reversed.join('');
    double result = double.parse(reversed);
    return isNegative ? -result : result;
  }
}

// 4. Számjegyek növekvő rendezése
int sortNumbersAsc(int integer) {
  String numberStr = integer.abs().toString();
  List<String> digits = numberStr.split('');
  digits.sort();
  int result = int.parse(digits.join(''));
  return integer < 0 ? -result : result;
}

// 5. Számjegyek csökkenő rendezése
int sortNumbersDes(num number) {
  String numberStr = number.abs().toString().replaceAll('.', '');
  List<String> digits = numberStr.split('');
  digits.sort((a, b) => b.compareTo(a));
  int result = int.parse(digits.join(''));
  return number < 0 ? -result : result;
}

// 6. FizzBuzz
String fizzBuzz(int integer) {
  if (integer % 15 == 0) {
    return 'FizzBuzz';
  } else if (integer % 3 == 0) {
    return 'Fizz';
  } else if (integer % 5 == 0) {
    return 'Buzz';
  } else {
    return integer.toString();
  }
}

// 7. Háromszög ellenőrzése oldalak alapján
bool isTriangleBySides(num a, num b, num c) {
  // Háromszög-egyenlőtlenség: bármelyik két oldal összege nagyobb kell legyen a harmadiknál
  return (a + b > c) && (a + c > b) && (b + c > a);
}

// 8. Háromszög ellenőrzése szögek alapján
bool isTriangleByAngles(num a, num b, num c) {
  // A háromszög belső szögeinek összege 180 fok kell legyen
  // és mindegyik szögnek pozitívnak kell lennie
  return (a > 0 && b > 0 && c > 0) && (a + b + c == 180);
}

// 9. Háromszög típusa szögek alapján
String triangleTypeByAngles(num a, num b, num c) {
  if (!isTriangleByAngles(a, b, c)) {
    return 'érvénytelen háromszög';
  }
  
  List<num> angles = [a, b, c];
  angles.sort();
  
  // Derékszögű háromszög (90 fokos szög)
  if (angles.contains(90)) {
    return 'derékszögű háromszög';
  }
  
  // Tompaszögű háromszög (van 90 foknál nagyobb szög)
  if (angles[2] > 90) {
    return 'tompaszögű háromszög';
  }
  
  // Hegyesszögű háromszög (minden szög 90 foknál kisebb)
  if (angles[2] < 90) {
    // Egyenlő oldalú háromszög (minden szög 60 fok)
    if (a == 60 && b == 60 && c == 60) {
      return 'egyenlő oldalú háromszög';
    }
    
    // Egyenlő szárú háromszög (két szög egyenlő)
    if (a == b || b == c || a == c) {
      return 'egyenlő szárú háromszög';
    }
    
    return 'hegyesszögű háromszög';
  }
  
  return 'általános háromszög';
}

// 10. Padovan számok
int padovanNumber(int n) {
  if (n == 0) return 0;
  if (n == 1 || n == 2) return 1;
  
  // Iteratív megoldás a hatékonyság érdekében
  int p0 = 0, p1 = 1, p2 = 1;
  
  for (int i = 3; i <= n; i++) {
    int pn = p0 + p1;  // pn = p(n-2) + p(n-3)
    p0 = p1;
    p1 = p2;
    p2 = pn;
  }
  
  return p2;
}