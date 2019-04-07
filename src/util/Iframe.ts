import Optional from "typescript-optional";
import uuid from "uuid";
export interface StyleRule {
  selector: string;
  styles: Map<string, string>;
}

export default class Iframe {
  public iframe: HTMLIFrameElement;

  constructor(el: HTMLIFrameElement) {
    this.iframe = el;
  }

  get window(): Optional<Window> {
    const w: Window | null = this.iframe.contentWindow;
    return Optional.ofNullable(w);
  }

  get document(): Document {
    return this.window.map(w => w.document).get();
  }

  get head(): HTMLHeadElement {
    return this.document.head;
  }

  public addScript(src: string, qid = ""): Promise<string> {
    const id = qid === "" ? uuid.v4() : qid;
    return new Promise(resolve => {
      const script = this.createScript(src);
      script.setAttribute("id", id);
      this.head.appendChild(script);
      script.onload = () => {
        resolve(id);
      };
    });
  }

  public addStyle(rules: StyleRule[]): void {
    this.head.appendChild(this.createStyle(rules));
  }

  public addLink(href: string, qid = ""): string {
    const ele = this.createLink(href);
    const id = qid === "" ? uuid.v4() : qid;
    ele.setAttribute("id", id);
    this.head.appendChild(ele);
    return id;
  }

  private createLink(link: string): HTMLLinkElement {
    const ele = document.createElement("link");
    ele.setAttribute("href", link);
    ele.setAttribute("rel", "stylesheet");
    return ele;
  }

  private createScript(src: string): HTMLScriptElement {
    const script = document.createElement("script");
    script.setAttribute("src", src);
    return script;
  }

  private createStyle(rules: StyleRule[]): HTMLStyleElement {
    const ele = document.createElement("style");
    ele.innerHTML = rules
      .map(rule => {
        const style: string = Array.from(rule.styles.keys())
          .map((k: string) => `${k}: ${rule.styles.get(k)};`)
          .join("\n");
        return `${rule.selector} {\n ${style}\n}`;
      })
      .join("\n");
    return ele;
  }
}
