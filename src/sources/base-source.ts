import https from 'https';
class BaseSource {
    /**
     * Send a request to the specified destination
     *
     * @param {RequestInfo} input - The RequestInfo
     * @param {RequestInit} init - The RequestInit
     * @returns {T} The response from the destination
     */
    static async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
        return fetch(url, options)
            .then((response) => {
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((response) => response as T);
    }

    public static isSiteUp(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const req = https.get(url, function (res) {
                return resolve(res.statusCode >= 200 && res.statusCode < 300);
            });
    
            req.on("error", function () {
                return resolve(false);
            });
    
            req.setTimeout(2000, function() {
                req.destroy();
            });
        }).catch(() => false);
    }
}

export default BaseSource;
