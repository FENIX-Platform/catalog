package org.fao.fenix.catalog.search.dto.resource.dsd;

public class CodeListDSD implements ResourceDSD {

    public static enum CodeListStructure {
        list,tree,graph;
    }

    private CodeListStructure type;

    public CodeListDSD() {}

    public CodeListDSD(CodeListStructure type) {
        this.type = type;
    }

    public CodeListStructure getType() {
        return type;
    }

    public void setType(CodeListStructure type) {
        this.type = type;
    }
}
