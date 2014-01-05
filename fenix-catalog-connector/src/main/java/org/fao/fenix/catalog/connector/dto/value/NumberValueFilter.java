package org.fao.fenix.catalog.connector.dto.value;

public class NumberValueFilter extends ValueFilter {

    private Number from,to;

    public NumberValueFilter(Number from, Number to) {
        this.from = from;
        this.to = to;
    }

    public Number getFrom() {
        return from;
    }

    public Number getTo() {
        return to;
    }
}
