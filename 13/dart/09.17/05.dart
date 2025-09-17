import 'dart:io';

void main(){
print("Adj meg egy számot");
String? input = stdin.readLineSync()!;
List<int> digits = input.split('').map(int.parse).toList();

digits.foreach(number) => print({pow(number, 2)});

}