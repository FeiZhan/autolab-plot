CFLAGS =
INCLUDES =
LIBS =
CC = g++

dataparser:			main.o DataParser.o DataCalculator.o Plot.o
					$(CC) -o $@ main.o DataParser.o DataCalculator.o Plot.o
main.o:				main.cpp
DataParser.o:		DataParser.cpp
DataCalculator.o:	DataCalculator.cpp
Plot.o:				Plot.cpp

clean: 
	rm -f *.o *.gch a.out
