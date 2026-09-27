export interface CommonDict {
  profile: string;
  projects: string;
  about: string;
  /** January..December, in order — shared by the journey timeline and the
   * project page's duration formatting. */
  months: readonly string[];
}

export const commonFr: CommonDict = {
  profile: "Profil",
  projects: "Projets",
  about: "À propos",
  months: [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ],
};

export const commonEn: CommonDict = {
  profile: "Profile",
  projects: "Projects",
  about: "About",
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};
