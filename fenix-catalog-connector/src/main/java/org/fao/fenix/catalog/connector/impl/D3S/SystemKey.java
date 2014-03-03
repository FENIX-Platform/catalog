package org.fao.fenix.catalog.connector.impl.D3S;

public class SystemKey {
    private String system;
    private String version;


    public SystemKey(String system, String version) {
        this.system = system;
        this.version = version;
    }


    public String getSystem() {
        return system;
    }

    public void setSystem(String system) {
        this.system = system;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
