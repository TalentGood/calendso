import { HeadSeo } from "@components/seo/head-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { CalendarIcon, ClockIcon, ExclamationIcon, LocationMarkerIcon } from "@heroicons/react/solid";
import prisma, { whereAndSelect } from "@lib/prisma";
import { EventTypeCustomInputType } from "@prisma/client";
import { collectPageParameters, telemetryEventTypes, useTelemetry } from "@lib/telemetry";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import PhoneInput from "@components/ui/form/PhoneInput";
import { LocationType } from "@lib/location";
import Avatar from "@components/Avatar";
import { Button } from "@components/ui/Button";
import Theme from "@components/Theme";
import { ReactMultiEmail } from "react-multi-email";
import { Nav } from "../../components/nav/nav";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function Book(props: any): JSX.Element {
  const router = useRouter();
  const { date, user, rescheduleUid } = router.query;

  const [is24h, setIs24h] = useState(false);
  const [preferredTimeZone, setPreferredTimeZone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [guestToggle, setGuestToggle] = useState(false);
  const [guestEmails, setGuestEmails] = useState([]);
  const locations = props.eventType.locations || [];

  const [selectedLocation, setSelectedLocation] = useState<LocationType>(
    locations.length === 1 ? locations[0].type : ""
  );

  const { isReady } = Theme(props.user.theme);
  const telemetry = useTelemetry();

  useEffect(() => {
    setPreferredTimeZone(localStorage.getItem("timeOption.preferredTimeZone") || dayjs.tz.guess());
    setIs24h(!!localStorage.getItem("timeOption.is24hClock"));

    telemetry.withJitsu((jitsu) => jitsu.track(telemetryEventTypes.timeSelected, collectPageParameters()));
  });

  function toggleGuestEmailInput() {
    setGuestToggle(!guestToggle);
  }

  const locationInfo = (type: LocationType) => locations.find((location) => location.type === type);

  // TODO: Move to translations
  const locationLabels = {
    [LocationType.InPerson]: "In-person meeting",
    [LocationType.Phone]: "Phone call",
    [LocationType.GoogleMeet]: "Google Meet",
    [LocationType.Zoom]: "Zoom Video",
  };

  const bookingHandler = (event) => {
    const book = async () => {
      setLoading(true);
      setError(false);
      let notes = "";
      if (props.eventType.customInputs) {
        notes = props.eventType.customInputs
          .map((input) => {
            const data = event.target["custom_" + input.id];
            if (data) {
              if (input.type === EventTypeCustomInputType.BOOL) {
                return input.label + "\n" + (data.checked ? "Yes" : "No");
              } else {
                return input.label + "\n" + data.value;
              }
            }
          })
          .join("\n\n");
      }
      if (!!notes && !!event.target.notes.value) {
        notes += "\n\nAdditional notes:\n" + event.target.notes.value;
      } else {
        notes += event.target.notes.value;
      }

      const payload = {
        start: dayjs(date).format(),
        end: dayjs(date).add(props.eventType.length, "minute").format(),
        name: event.target.name.value,
        email: event.target.email.value,
        notes: notes,
        guests: guestEmails,
        timeZone: preferredTimeZone,
        eventTypeId: props.eventType.id,
        rescheduleUid: rescheduleUid,
      };

      if (selectedLocation) {
        switch (selectedLocation) {
          case LocationType.Phone:
            payload["location"] = event.target.phone.value;
            break;

          case LocationType.InPerson:
            payload["location"] = locationInfo(selectedLocation).address;
            break;

          // Catches all other location types, such as Google Meet, Zoom etc.
          default:
            payload["location"] = selectedLocation;
        }
      }

      telemetry.withJitsu((jitsu) =>
        jitsu.track(telemetryEventTypes.bookingConfirmed, collectPageParameters())
      );

      /*const res = await */
      fetch("/api/book/" + user, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      // TODO When the endpoint is fixed, change this to await the result again
      //if (res.ok) {
      let successUrl = `/success?date=${date}&type=${props.eventType.id}&user=${
        props.user.username
      }&reschedule=${!!rescheduleUid}&name=${payload.name}`;
      if (payload["location"]) {
        if (payload["location"].includes("integration")) {
          successUrl += "&location=" + encodeURIComponent("Web conferencing details to follow.");
        } else {
          successUrl += "&location=" + encodeURIComponent(payload["location"]);
        }
      }

      await router.push(successUrl);
      /*} else {
                setLoading(false);
                setError(true);
            }*/
    };

    event.preventDefault();
    book();
  };

  const randomImages = [
    "/images/partner-1.png",
    "/images/partner-2.png",
    "/images/partner-3.png",
    "/images/partner-4.png",
    "/images/partner-5.png",
    "/images/partner-6.png",
    "/images/partner-7.png",
    "/images/partner-8.png",
  ];

  function shuffled(array: any) {
    let currentIndex = array.length,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  const randomImagesAfterShuffled = shuffled(randomImages);
  return (
    isReady && (
      <div>
        <HeadSeo
          title={`${rescheduleUid ? "Reschedule" : "Confirm"} your ${props.eventType.title} with ${
            props.user.name || props.user.username
          }`}
          description={`${rescheduleUid ? "Reschedule" : "Confirm"} your ${props.eventType.title} with ${
            props.user.name || props.user.username
          }`}
        />
        <Nav />
        <main className="max-w-3xl mx-auto my-0 sm:my-24">
          <div className="calendar-title-container">
            <div className="calendar-title">Schedule a Demo. Start your FREE Pilot.</div>
            <div className="calendar-title-inner">
              Explorer all-in-one Edorer and how it can empower your university / college. Kickstart a FREE
              Pilot!
            </div>
          </div>
          <div className="dark:bg-neutral-900 bg-white overflow-hidden border border-gray-200 dark:border-0 sm:rounded-sm">
            <div className="sm:flex px-4 py-5 sm:p-4">
              <div className="sm:w-1/2 sm:border-r sm:dark:border-black">
                <Avatar
                  displayName={props.user.name}
                  imageSrc={props.user.avatar}
                  className="w-16 h-16 rounded-full mb-4"
                />
                <h2 className="font-medium dark:text-gray-300 text-gray-500">{props.user.name}</h2>
                <h1 className="text-3xl font-semibold dark:text-white text-gray-800 mb-4 event-title">
                  {props.eventType.title}
                </h1>
                <p className="text-gray-500 mb-2">
                  <ClockIcon className="inline-block w-4 h-4 mr-1 -mt-1" />
                  {props.eventType.length} minutes
                </p>
                {selectedLocation === LocationType.InPerson && (
                  <p className="text-gray-500 mb-2">
                    <LocationMarkerIcon className="inline-block w-4 h-4 mr-1 -mt-1" />
                    {locationInfo(selectedLocation).address}
                  </p>
                )}
                <p className="text-green-500 mb-4">
                  <CalendarIcon className="inline-block w-4 h-4 mr-1 -mt-1" />
                  {preferredTimeZone &&
                    dayjs(date)
                      .tz(preferredTimeZone)
                      .format((is24h ? "H:mm" : "h:mma") + ", dddd DD MMMM YYYY")}
                </p>
                <p className="dark:text-white text-gray-600 mb-8">{props.eventType.description}</p>
              </div>
              <div className="sm:w-1/2 sm:pl-8 sm:pr-4">
                <form onSubmit={bookingHandler}>
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium dark:text-white text-gray-700 form-information-font">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md border-radius"
                        placeholder="John Doe"
                        defaultValue={props.booking ? props.booking.attendees[0].name : ""}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium dark:text-white text-gray-700 form-information-font">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md border-radius"
                        placeholder="you@example.com"
                        defaultValue={props.booking ? props.booking.attendees[0].email : ""}
                      />
                    </div>
                  </div>
                  {locations.length > 1 && (
                    <div className="mb-4">
                      <span className="block text-sm font-medium dark:text-white text-gray-700 form-information-font">
                        Location
                      </span>
                      {locations.map((location) => (
                        <label key={location.type} className="block">
                          <input
                            type="radio"
                            required
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="location focus:ring-black h-4 w-4 text-black border-gray-300 mr-2 border-radius"
                            name="location"
                            value={location.type}
                            checked={selectedLocation === location.type}
                          />
                          <span className="text-sm ml-2 dark:text-gray-500 form-information-font">
                            {locationLabels[location.type]}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {selectedLocation === LocationType.Phone && (
                    <div className="mb-4">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium dark:text-white text-gray-700 form-information-font">
                        Phone number
                      </label>
                      <div className="mt-1">
                        <PhoneInput name="phone" placeholder="Enter phone number" id="phone" required />
                      </div>
                    </div>
                  )}
                  {props.eventType.customInputs &&
                    props.eventType.customInputs
                      .sort((a: any, b: any) => a.id - b.id)
                      .map((input) => (
                        <div className="mb-4" key={"input-" + input.label.toLowerCase}>
                          {input.type !== EventTypeCustomInputType.BOOL && (
                            <label
                              htmlFor={"custom_" + input.id}
                              className="block text-sm font-medium text-gray-700 dark:text-white mb-1 form-information-font">
                              {input.label}
                            </label>
                          )}
                          {input.type === EventTypeCustomInputType.TEXTLONG && (
                            <textarea
                              name={"custom_" + input.id}
                              id={"custom_" + input.id}
                              required={input.required}
                              rows={3}
                              className="shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md border-radius"
                              placeholder={input.placeholder}
                            />
                          )}
                          {input.type === EventTypeCustomInputType.TEXT && (
                            <input
                              type="text"
                              name={"custom_" + input.id}
                              id={"custom_" + input.id}
                              required={input.required}
                              className="shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md border-radius"
                              placeholder={input.placeholder}
                            />
                          )}
                          {input.type === EventTypeCustomInputType.NUMBER && (
                            <input
                              type="number"
                              name={"custom_" + input.id}
                              id={"custom_" + input.id}
                              required={input.required}
                              className="shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md border-radius"
                              placeholder=""
                            />
                          )}
                          {input.type === EventTypeCustomInputType.BOOL && (
                            <div className="flex items-center h-5">
                              <input
                                type="checkbox"
                                name={"custom_" + input.id}
                                id={"custom_" + input.id}
                                className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded mr-2 border-radius"
                                placeholder=""
                              />
                              <label
                                htmlFor={"custom_" + input.id}
                                className="block text-sm font-medium text-gray-700 dark:text-white mb-1 form-information-font">
                                {input.label}
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                  <div className="mb-4">
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium dark:text-white text-gray-700 mb-1 form-information-font">
                      University name
                    </label>
                    <input
                      name="notes"
                      id="notes"
                      type="text"
                      className="shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md border-radius"
                      placeholder="Type here..."
                    />
                  </div>
                  <div className="mb-4">
                    {!guestToggle && (
                      <label
                        onClick={toggleGuestEmailInput}
                        htmlFor="guests"
                        className="block text-sm font-medium dark:text-white text-blue-500 mb-1 hover:cursor-pointer form-information-font add-guest">
                        + Additional Guests
                      </label>
                    )}
                    {guestToggle && (
                      <div>
                        <label
                          htmlFor="guests"
                          className="block text-sm font-medium dark:text-white text-gray-700 mb-1 form-information-font">
                          Guests
                        </label>
                        <ReactMultiEmail
                          placeholder="guest@example.com"
                          emails={guestEmails}
                          onChange={(_emails: any[]) => {
                            setGuestEmails(_emails);
                          }}
                          getLabel={(email: string, index: number, removeEmail: (index: number) => void) => {
                            return (
                              <div data-tag key={index}>
                                {email}
                                <span data-tag-handle onClick={() => removeEmail(index)}>
                                  ×
                                </span>
                              </div>
                            );
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start flex-end">
                    {/* TODO: add styling props to <Button variant="" color="" /> and get rid of btn-primary */}
                    <Link
                      href={
                        "/" +
                        props.user.username +
                        "/" +
                        props.eventType.slug +
                        (rescheduleUid ? "?rescheduleUid=" + rescheduleUid : "")
                      }>
                      <a className="ml-2 text-sm dark:text-white p-2 cancel-btn">Cancel</a>
                    </Link>
                    <Button confirmation={true} type="submit" loading={loading}>
                      {rescheduleUid ? "Reschedule" : "Confirm"}
                    </Button>
                  </div>
                </form>
                {error && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-2">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Could not {rescheduleUid ? "reschedule" : "book"} the meeting. Please try again or{" "}
                          <a
                            href={"mailto:" + props.user.email}
                            className="font-medium underline text-yellow-700 hover:text-yellow-600">
                            Contact {props.user.name} via e-mail
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="partner-logos-container">
            <div className="partner-logos-title">Leading University Love Edorer</div>
            <div className="partner-logos-list">
              {randomImagesAfterShuffled.map((image, index) => (
                <div className="image-container" key={index}>
                  <img src={image} alt="" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  );
}

export async function getServerSideProps(context) {
  const user = await whereAndSelect(
    prisma.user.findFirst,
    {
      username: context.query.user,
    },
    ["username", "name", "email", "bio", "avatar", "theme"]
  );

  const eventType = await prisma.eventType.findUnique({
    where: {
      id: parseInt(context.query.type),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      length: true,
      locations: true,
      customInputs: true,
      periodType: true,
      periodDays: true,
      periodStartDate: true,
      periodEndDate: true,
      periodCountCalendarDays: true,
    },
  });

  const eventTypeObject = [eventType].map((e) => {
    return {
      ...e,
      periodStartDate: e.periodStartDate?.toString() ?? null,
      periodEndDate: e.periodEndDate?.toString() ?? null,
    };
  })[0];

  let booking = null;

  if (context.query.rescheduleUid) {
    booking = await prisma.booking.findFirst({
      where: {
        uid: context.query.rescheduleUid,
      },
      select: {
        description: true,
        attendees: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  }

  return {
    props: {
      user,
      eventType: eventTypeObject,
      booking,
    },
  };
}
