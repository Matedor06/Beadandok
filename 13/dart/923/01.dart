import 'dart:io';
void main(){
  print("Enter a number between 1 and 100:");
  int? number = int.parse(stdin.readLineSync()!);
  
  if (number >= 1 && number <= 100) {
    for (int i = 0; i < number; i++) {
      print("Happy birthday!");
      print("Happy birthday to you!");
    }
  } else {
    print("Please enter a number between 1 and 100.");
  }

}