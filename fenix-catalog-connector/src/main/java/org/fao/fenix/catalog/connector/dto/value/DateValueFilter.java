package org.fao.fenix.catalog.connector.dto.value;

import java.util.Date;

public class DateValueFilter extends ValueFilter {
    private Date from,to;

    public DateValueFilter(Date from, Date to) {
        this.from = from;
        this.to = to;
    }

    public Date getFrom() { return from; }

    public Date getTo() {
        return to;
    }
}
