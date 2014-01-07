package org.fao.fenix.catalog.dto.value;

public class TextFilter extends ValueFilter {
    private String separator = "(\\s+)";

    private String text;
    private String[] tokens;

    public TextFilter(String text) {
        if ((this.text = text)!=null)
            tokens = text.split(separator);
    }


    public String getText() {
        return text;
    }

    public String[] getTokens() {
        return tokens;
    }
}
