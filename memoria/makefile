pdf: agra.md toc.md acro.md memoria.md info.yaml template.tex
	find -name "*.png" -exec mogrify -density 96 -units PixelsPerInch {} \;
	pandoc agra.md toc.md acro.md memoria.md info.yaml -N --template template.tex -o memoria.pdf

clean:
	rm memoria.pdf
