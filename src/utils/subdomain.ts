/**
 * Extracts the subdomain from the current window location.
 * 
 * Rules:
 * 1. Ignores 'localhost' and IP addresses (returns null).
 * 2. Ignores 'www'.
 * 3. Returns the first part of the hostname if it's a valid subdomain.
 *    e.g. starosel.event4u.bg -> starosel
 *    e.g. event4u.bg -> null
 */
export const getSubdomain = (): string | null => {
    if (typeof window === 'undefined') return null;

    const hostname = window.location.hostname;
    
    // Handle Localhost and IPs
    if (hostname.includes('localhost') || hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      return null;
    }
  
    const parts = hostname.split('.');
    
    // e.g. event4u.bg (2 parts) -> null
    // e.g. co.uk (2 parts) -> null (simplified logic, assumes 2nd level domains are not subdomains for this app)
    if (parts.length <= 2) return null;
    
    let sub = parts[0];
    
    // Handle www.starosel.event4u.bg
    if (sub === 'www') {
        // If starts with www, check if there is another subdomain
        return parts.length > 3 ? parts[1] : null;
    }
    
    return sub;
};