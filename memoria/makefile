pdf: toc.tex memoria.md info.yaml template.tex
	find -name "*.png" -exec mogrify -density 96 -units PixelsPerInch {} \;
	pandoc -f markdown toc.tex memoria.md info.yaml -N --template template.tex -o memoria.pdf

clean:
	rm memoria.pdf
