interface Person {
    readonly firstName: string;
    readonly lastName: string;
    readonly fullName: string;
    greet: () => string;
}

class User implements Person {
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`
    }

    constructor(readonly firstName: string, readonly lastName: string) {
    }

    greet(): string {
        return `Hello, ${this.fullName}!`;
    }
}

const displayGreeting = (person: Person, el: HTMLElement) => {
    el.innerHTML = `<h1>${person.greet()}</h1>`;
};

let user = new User("Corey", "White");
let body = document.body;
displayGreeting(user, body);