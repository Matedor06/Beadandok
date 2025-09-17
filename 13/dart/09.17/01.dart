import 'dart:io';
void main(){

print("Enter a number:");
int? number1 = int.parse(stdin.readLineSync()!);

print("Enter a  second number:");
int? number2 = int.parse(stdin.readLineSync()!);


if(number1 > number2)
{
    int seged = 0;
    seged = number1;
    number1 = number2;
    number2 = seged;
}

for(int i = number1; i <= number2;i++)
{
    print(i);
}

}