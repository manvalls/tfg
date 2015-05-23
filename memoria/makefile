memoria.pdf: pini.pdf cuerpo.pdf
	pdfunite pini.pdf cuerpo.pdf memoria.pdf

cuerpo.pdf: agra.md toc.md acro.md memoria.md info.yaml template.tex
	find -name "*.png" -exec mogrify -density 96 -units PixelsPerInch {} \;
	pandoc agra.md toc.md acro.md memoria.md info.yaml -N --template template.tex -o cuerpo.pdf

pini.pdf: pini.odt
	soffice --headless --convert-to pdf pini.odt

clean:
	rm cuerpo.pdf
	rm pini.pdf
	rm memoria.pdf
